import { tmpdir } from 'os';
import * as path from 'path';
import { readFileSync } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import webpack from 'webpack';
import sizeOf from 'image-size';
import formatHtml from 'diffable-html';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fixtures = path.resolve(__dirname, 'fixtures');
export const expected = path.resolve(fixtures, 'expected');
export const logo = path.resolve(fixtures, 'logo.png');
export const logoMaskable = path.resolve(fixtures, 'logo-maskable.png');
export const empty = path.resolve(fixtures, 'empty.png');
export const invalid = path.resolve(fixtures, 'invalid.png');
/** the size of the webpack cache without favicons */
export const cacheBaseSize = 60000;

export const withTempDirectory = (test) => {
  test.beforeEach(async (t) => {
    t.context.root = await mkdtemp(path.join(tmpdir(), 'Favicons'));
  });
  test.afterEach(async (t) => {
    await rm(t.context.root, { recursive: true, force: true });
  });
};

export const compiler = (config) => {
  config = {
    entry: path.resolve(fixtures, 'entry.js'),
    plugins: [],
    output: {},
    infrastructureLogging: {
      level: 'info',
    },
    ...config,
  };

  config.plugins
    .filter((plugin) => plugin.constructor.name === 'HtmlWebpackPlugin')
    .forEach((plugin) => {
      Object.assign(plugin.userOptions, {
        meta: {},
        minify: false,
        chunks: [],
        template: path.resolve(fixtures, 'index.html'),
      });
    });

  return webpack(config);
};

export const run = (compiler) =>
  new Promise((resolve, reject) => {
    compiler.run((err, stats) =>
      err || stats.hasErrors()
        ? reject(err || stats.toJson().errors)
        : compiler.close(() => (err ? reject(err) : resolve(stats)))
    );
  });

export const generate = (config) => run(compiler(config));

export const snapshotCompilationAssets = (t, compilerStats) => {
  const assetNames = [...compilerStats.compilation.emittedAssets].sort();
  const distPath = compilerStats.compilation.outputOptions.path;
  // Check if all files are generated correctly
  t.snapshot(
    assetNames.map((assetName) => replaceHash(replaceBackSlashes(assetName)))
  );
  const htmlFiles = /\.html?$/;
  const textFiles = /\.(json|html?|webapp|xml|webmanifest)$/;
  // CSS and JS files are not touched by this plugin
  // therefore those files are excluded from snapshots
  const ignoredFiles = /\.(js|css)$/;
  // Transform assets into a comparable view
  const assetContents = assetNames
    .filter((assetName) => !ignoredFiles.test(assetName))
    .map((assetName) => {
      const filepath = path.resolve(distPath, assetName);
      const isTxtFile = textFiles.test(assetName);
      const content = readFileSync(filepath);
      const textContent = replaceHash(
        !isTxtFile ? '' : content.toString('utf8')
      );
      const formattedContent =
        textContent && htmlFiles.test(assetName)
          ? formatHtml(textContent)
          : textContent;

      return {
        assetName: replaceHash(replaceBackSlashes(assetName)),
        content:
          content.length === ''
            ? 'EMPTY FILE'
            : isTxtFile
            ? formattedContent.replace(/\r/g, '')
            : getFileDetails(assetName, content),
      };
    });
  t.snapshot(assetContents);
};

function getFileDetails(assetName, buffer) {
  try {
    const size = sizeOf(buffer);

    return `${size.type} ${size.width}x${size.height}`;
  } catch (e) {
    return `binary ${replaceBackSlashes(assetName)}`;
  }
}

/**
 * Replace hashses to allow using the same snapshots for different versions of this library
 * hashes will only be found if they are in a parent directory with the name "prefix"
 */
function replaceHash(content) {
  return content.replace(
    /(prefix\/)([0-9A-Fa-f]*)(\/)/g,
    (_, prefix, hash, suffix) => {
      return `${prefix}__replaced_hash_${hash.length}${suffix}`;
    }
  );
}

/**
 * This utils replaces file paths used in snapshots
 * to support running all tests also on Windows machines
 *
 * e.g. \\assets\\favicon.png -> /assets/favicon.png
 *
 * @param {string} content
 */
function replaceBackSlashes(content) {
  return content.split(path.sep).join('/');
}

import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, sep } from 'node:path';
import { readFileSync } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import webpack from 'webpack';
import { imageSize } from 'image-size';
import formatHtml from 'diffable-html';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const fixtures = resolve(__dirname, 'fixtures');
export const expected = resolve(fixtures, 'expected');
export const logo = resolve(fixtures, 'logo.png');
export const logoMaskable = resolve(fixtures, 'logo-maskable.png');
export const empty = resolve(fixtures, 'empty.png');
export const invalid = resolve(fixtures, 'invalid.png');
/** the size of the webpack cache without favicons */
export const cacheBaseSize = 60000;

export const createTempDir = async (name) => {
  const hash = createHash('md5').update(name).digest('hex');
  return await mkdtemp(join(tmpdir(), `Favicons-${hash}`));
};

export const removeTempDir = async (dir) => {
  await rm(dir, { recursive: true, force: true });
};

export const compiler = (config) => {
  config = {
    entry: resolve(fixtures, 'entry.js'),
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
        template: resolve(fixtures, 'index.html'),
      });
    });

  return webpack(config);
};

export const run = (compiler) =>
  new Promise((resolve, reject) => {
    compiler.run((err, stats) =>
      err || stats.hasErrors()
        ? reject(err || stats.toJson().errors)
        : compiler.close(() => resolve(stats)),
    );
  });

export const generate = (config) => run(compiler(config));

export const snapshotCompilationAssets = (compilerStats) => {
  const assetNames = [...compilerStats.compilation.emittedAssets].sort();
  const distPath = compilerStats.compilation.outputOptions.path;

  const htmlFiles = /\.html?$/;
  const textFiles = /\.(json|html?|webapp|xml|webmanifest)$/;
  // CSS and JS files are not touched by this plugin
  // therefore those files are excluded from snapshots
  const ignoredFiles = /\.(js|css)$/;
  // Transform assets into a comparable view
  const assetContents = assetNames
    .filter((assetName) => !ignoredFiles.test(assetName))
    .map((assetName) => {
      const filepath = resolve(distPath, assetName);
      const isTxtFile = textFiles.test(assetName);
      const content = readFileSync(filepath);
      const textContent = replaceHash(
        !isTxtFile ? '' : content.toString('utf8'),
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

  // Check if all files are generated correctly
  return {
    files: assetNames.map((assetName) =>
      replaceHash(replaceBackSlashes(assetName)),
    ),
    content: assetContents,
  };
};

function getFileDetails(assetName, buffer) {
  try {
    const size = imageSize(buffer);

    const sizes = size.images
      ? size.images.map((i) => `${i.width}x${i.height}`).join(' ')
      : `${size.width}x${size.height}`;

    return `${size.type} ${sizes}`;
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
    },
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
  return content.split(sep).join('/');
}

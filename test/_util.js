const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const merge = require('webpack-merge');
const sizeOf = require('image-size');
const formatHtml = require('diffable-html');

const fixtures = path.resolve(__dirname, 'fixtures');
module.exports.expected = path.resolve(fixtures, 'expected');
module.exports.logo = path.resolve(fixtures, 'logo.png');
module.exports.empty = path.resolve(fixtures, 'empty.png');
module.exports.invalid = path.resolve(fixtures, 'invalid.png');
/** the size of the webpack cache without favicons */
module.exports.cacheBaseSize = 60000;

module.exports.mkdir = () => fs.mkdtemp(path.join(os.tmpdir(), 'Favicons'));

module.exports.compiler = config => {
  config = merge(
    {
      entry: path.resolve(fixtures, 'entry.js'),
      plugins: [],
      output: {},
      infrastructureLogging: {
        level: 'info'
      }
    },
    config
  );

  config.plugins
    .filter(plugin => plugin.constructor.name === 'HtmlWebpackPlugin')
    .forEach(plugin => {
      Object.assign(plugin.userOptions, {
        meta: {},
        minify: false,
        chunks: [],
        template: path.resolve(fixtures, 'index.html')
      });
    });

  return webpack(config);
};

module.exports.run = compiler =>
  new Promise((resolve, reject) => {
    compiler.run((err, stats) =>
      err || stats.hasErrors()
        ? reject(err || stats.toJson().errors)
        : compiler.close(() => (err ? reject(err) : resolve(stats)))
    );
  });

module.exports.generate = config =>
  module.exports.run(module.exports.compiler(config));

module.exports.snapshotCompilationAssets = (t, compilerStats) => {
  const assetNames = [...compilerStats.compilation.emittedAssets].sort();
  const distPath = compilerStats.compilation.outputOptions.path;
  // Check if all files are generated correctly
  t.snapshot(
    assetNames.map(assetName => replaceHash(replaceBackSlashes(assetName)))
  );
  const htmlFiles = /\.html?$/;
  const textFiles = /\.(json|html?|webapp|xml)$/;
  // CSS and JS files are not touched by this plugin
  // therefore those files are excluded from snapshots
  const ignoredFiles = /\.(js|css)$/;
  // Transform assets into a comparable view
  const assetContents = assetNames
    .filter(assetName => !ignoredFiles.test(assetName))
    .map(assetName => {
      const filepath = path.resolve(distPath, assetName);
      const isTxtFile = textFiles.test(assetName);
      const content = fs.readFileSync(filepath);
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
            : getFileDetails(assetName, content)
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

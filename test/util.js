const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const merge = require('webpack-merge');

const fixtures = path.resolve(__dirname, 'fixtures');
module.exports.expected = path.resolve(fixtures, 'expected');
module.exports.logo = path.resolve(fixtures, 'logo.png');
module.exports.empty = path.resolve(fixtures, 'empty.png');
module.exports.invalid = path.resolve(fixtures, 'invalid.png');

module.exports.mkdir = () => fs.mkdtemp(path.join(os.tmpdir(), 'WWP'));

module.exports.compiler = (config) => {
  config = merge(
    {
      entry: path.resolve(fixtures, 'entry.js'),
      plugins: [],
    },
    config
  );

  config.plugins
    .filter(plugin => plugin.constructor.name === 'HtmlWebpackPlugin')
    .forEach(plugin => {
      Object.assign(plugin.options, {
        meta: {},
        minify: false,
        chunks: [],
        template: path.resolve(fixtures, 'index.html')
      });
    });

  return webpack(config);
}

module.exports.run = (compiler) => new Promise((resolve, reject) => {
  compiler.run((err, stats) => (err || stats.hasErrors())
    ? reject(err || stats.toJson().errors)
    : resolve(stats)
  );
});

module.exports.generate = (config) => module.exports.run(module.exports.compiler(config));

module.exports.snapshotCompilationAssets = (t, compilerStats) => {
  const assets = compilerStats.compilation.assets;
  const assetNames = Object.keys(assets).sort();
  // Check if all files are generated correctly
  t.snapshot(assetNames);
  const textFiles = /\.(json|html?)$/;
  // CSS and JS files are not touched by this plugin
  // therefore those files are excluded from snapshots
  const ignoredFiles = /\.(js|css)$/;
  // Transform assets into a comparable view
  const assetContents = assetNames
    .filter((assetName) => !ignoredFiles.test(assetName))
    .map((assetName) => {
      const isTxtFile = textFiles.test(assetName);
      const content = assets[assetName].source().toString('utf8').replace(/\r/g, '');
      return {
        assetName,
        content: content.length === '' ? 'EMPTY FILE' : (isTxtFile ? content : 'binary'),
    }});
  t.snapshot(assetContents);
}
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const merge = require('webpack-merge');
const dircompare = require('dir-compare');

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

module.exports.compare = async (a, b) => {
  const diff = await dircompare.compare(a, b, { compareContent: true, excludeFilter: '*.js' });
  return diff.diffSet.filter(({ state }) => state !== 'equal')
    .map(({ path1, name1, path2, name2 }) => `${path.join(path1 || '', name1 + '')} ≠ ${path.join(path2 || '', name2 + '')}`)
}

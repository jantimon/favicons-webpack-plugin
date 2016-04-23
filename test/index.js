/* eslint-env es6 */
import test from 'ava';
import path from 'path';
import rimraf from 'rimraf';
import FaviconsWebpackPlugin from '..';
import denodeify from 'denodeify';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import dircompare from 'dir-compare';

const webpack = denodeify(require('webpack'));
let outputId = 0;
const LOGO_PATH = path.resolve(__dirname, 'fixtures/logo.png');

rimraf.sync(path.resolve(__dirname, '../dist'));

function baseWebpackConfig (plugin) {
  return {
    entry: path.resolve(__dirname, 'fixtures/entry.js'),
    output: {
      path: path.resolve(__dirname, '../dist', 'test-' + (outputId++))
    },
    plugins: [].concat(plugin)
  };
}

test('should throw error when called without arguments', async t => {
  t.plan(2);
  let plugin;
  try {
    plugin = new FaviconsWebpackPlugin();
  } catch (err) {
    t.is(err.message, 'FaviconsWebpackPlugin options are required');
  }
  t.is(plugin, undefined);
});

test('should take a string as argument', async t => {
  var plugin = new FaviconsWebpackPlugin(LOGO_PATH);
  t.is(plugin.options.logo, LOGO_PATH);
});

test('should take an object with just the logo as argument', async t => {
  var plugin = new FaviconsWebpackPlugin({ logo: LOGO_PATH });
  t.is(plugin.options.logo, LOGO_PATH);
});

test('should generate the expected default result', async t => {
  const stats = await webpack(baseWebpackConfig(new FaviconsWebpackPlugin({
    logo: LOGO_PATH
  })));
  const outputPath = stats.compilation.compiler.outputPath;
  const expected = path.resolve(__dirname, 'fixtures/expected/default');
  const compareResult = await dircompare.compare(outputPath, expected);
  const diffFiles = compareResult.diffSet.filter((diff) => diff.state !== 'equal');
  t.is(diffFiles[0], undefined);
});

test('should generate a configured JSON file', async t => {
  const stats = await webpack(baseWebpackConfig(new FaviconsWebpackPlugin({
    logo: LOGO_PATH,
    emitStats: true,
    statsFilename: 'iconstats.json'
  })));
  const outputPath = stats.compilation.compiler.outputPath;
  const expected = path.resolve(__dirname, 'fixtures/expected/default-with-json');
  const compareResult = await dircompare.compare(outputPath, expected);
  const diffFiles = compareResult.diffSet.filter((diff) => diff.state !== 'equal');
  t.is(diffFiles[0], undefined);
});

test('should work together with the html-webpack-plugin', async t => {
  const stats = await webpack(baseWebpackConfig([
    new FaviconsWebpackPlugin({
      logo: LOGO_PATH,
      emitStats: true,
      statsFilename: 'iconstats.json'
    }),
    new HtmlWebpackPlugin()
  ]));
  const outputPath = stats.compilation.compiler.outputPath;
  const expected = path.resolve(__dirname, 'fixtures/expected/default-with-html');
  const compareResult = await dircompare.compare(outputPath, expected);
  const diffFiles = compareResult.diffSet.filter((diff) => diff.state !== 'equal');
  t.is(diffFiles[0], undefined);
});


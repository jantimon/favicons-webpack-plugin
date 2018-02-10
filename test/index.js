import test from 'ava';
import path from 'path';
import rimraf from 'rimraf';
import denodeify from 'denodeify';
import dircompare from 'dir-compare';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from '..';

const webpack = denodeify(require('webpack'));

const compareOptions = {compareSize: true};

const FIXTURES = path.resolve(__dirname, 'fixtures');
const LOGO = path.resolve(FIXTURES, 'logo.svg');
const DIST = path.resolve(__dirname, 'dist');

rimraf.sync(DIST);

let outputId = 0;
function baseWebpackConfig (...plugins) {
  return {
    entry: path.resolve(FIXTURES, 'entry.js'),
    output: {
      filename: 'bundle.js',
      path: path.resolve(DIST, 'test-' + (outputId++)),
    },
    plugins: [...plugins]
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
  const expected = path.resolve(FIXTURES, 'expected/default');
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions);
  const diff = compareResult.diffSet.filter(({state}) => state !== 'equal').map(({name1, name2}) => `${name1} ≠ ${name2}`);
  t.deepEqual(diff, []);
});

test('should generate a configured JSON file', async t => {
  const stats = await webpack(baseWebpackConfig(new FaviconsWebpackPlugin({
    logo: LOGO_PATH,
    emitStats: true,
    statsFilename: 'iconstats.json'
  })));
  const outputPath = stats.compilation.compiler.outputPath;
  const expected = path.resolve(__dirname, 'fixtures/expected/generate-json');
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions);
  const diffFiles = compareResult.diffSet.filter((diff) => diff.state !== 'equal');
  t.is(diffFiles[0], undefined);
});

test('should work together with the html-webpack-plugin', async t => {
  const stats = await webpack(baseWebpackConfig([
    new FaviconsWebpackPlugin({
      logo: LOGO_PATH,
    }),
    new HtmlWebpackPlugin()
  ));
  const outputPath = stats.compilation.compiler.outputPath;
  const expected = path.resolve(FIXTURES, 'expected/generate-html');
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions);
  const diff = compareResult.diffSet.filter(({state}) => state !== 'equal').map(({name1, name2}) => `${name1} ≠ ${name2}`);
  t.deepEqual(diff, []);
});

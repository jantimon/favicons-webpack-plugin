const test = require('ava');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate, snapshotCompilationAssets } = require('./_util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should generate multiple light icons', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/'
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, mode: 'light' }),
      new FaviconsWebpackPlugin({ logo, mode: 'light', prefix: 'second/' })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

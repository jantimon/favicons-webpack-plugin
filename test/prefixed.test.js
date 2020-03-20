const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, generate, mkdir, snapshotCompilationAssets } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should allow configuring the output prefix', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({
        logo,
        prefix: 'custom/prefix/[contenthash:8]'
      })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should allow configuring the output prefix for light mode', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({
        logo,
        prefix: 'custom/prefix/[hash:8]',
        mode: 'light'
      })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test.afterEach(t => fs.remove(t.context.root));

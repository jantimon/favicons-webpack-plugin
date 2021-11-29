const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, generate, mkdir, snapshotCompilationAssets } = require('./_util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should correctly handle an empty prefix', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/'
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, prefix: '' })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test.afterEach(t => fs.remove(t.context.root));

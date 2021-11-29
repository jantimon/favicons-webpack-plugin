const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, generate, mkdir, snapshotCompilationAssets } = require('./_util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should take the public path into account', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/public/path'
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, mode: 'light' })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should work with an empty public path', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, mode: 'light' })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should work with an empty public path and a nested html file', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [
      new HtmlWebpackPlugin({ filename: 'demo/index.html' }),
      new FaviconsWebpackPlugin({ logo, mode: 'light' })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test.afterEach(t => fs.remove(t.context.root));

const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate, snapshotCompilationAssets } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should work together with the html-webpack-plugin', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin({ logo })]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should work together with the html-webpack-plugin with no <head></head> tags', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [
      new HtmlWebpackPlugin({ templateContent: '' }),
      new FaviconsWebpackPlugin({ logo })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test.afterEach(t => fs.remove(t.context.root));

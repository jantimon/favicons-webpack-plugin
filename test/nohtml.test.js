const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebappWebpackPlugin = require('../');

const {logo, mkdir, generate, compare, expected} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should allow disabling html injection', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new WebappWebpackPlugin({logo, inject: false}),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'nohtml')), []);
});

test('should respect HtmlWebpackPlugin@inject flag', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({inject: false}),
      new WebappWebpackPlugin({logo}),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'nohtml')), []);
});

test('should respect HtmlWebpackPlugin@favicons flag', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({favicons: false}),
      new WebappWebpackPlugin({logo}),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'nohtml')), []);
});

test.afterEach(t => fs.remove(t.context.root));

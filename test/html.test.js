const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const {logo, mkdir, generate, compare, expected} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should work together with the html-webpack-plugin', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({logo}),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'html')), []);
});

test('should inject html despite HtmlWebpackPlugin@inject flag with inject force', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({inject: false}),
      new WebappWebpackPlugin({logo, inject: 'force'}),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'html')), []);
});

test('should work together with the html-webpack-plugin with no <head></head> tags', async t => {
    const dist = path.join(t.context.root, 'dist');
    await generate({
        context: t.context.root,
        output: {
            path: dist,
        },
        plugins: [
            new HtmlWebpackPlugin({templateContent: ''}),
            new WebappWebpackPlugin({logo}),
        ],
    });

    t.deepEqual(await compare(dist, path.resolve(expected, 'htmlnohead')), []);
});

test.afterEach(t => fs.remove(t.context.root));

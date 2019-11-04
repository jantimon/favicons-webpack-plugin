const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, generate, mkdir, compare, expected } = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should allow for overriding the publicPath option in webapp mode', async t => {
  const dist = path.join(t.context.root, 'dist');

  await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/public/path',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, publicPath: '/another/path' }),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'publicpathoption')), []);
});

test('should allow for overriding the publicPath option in light mode', async t => {
  const dist = path.join(t.context.root, 'dist');

  await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/public/path',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, publicPath: '/another/path', mode: 'light' }),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'publicpathoptionlight')), []);
});

test.afterEach(t => fs.remove(t.context.root));

const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate, compare, expected } = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should work if manual set to light mode', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, mode: 'light' }),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'light')), []);
});

test('should automatically pick up the dev mode from webpack', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    mode: 'development',
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo }),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'light')), []);
})

test.afterEach(t => fs.remove(t.context.root));

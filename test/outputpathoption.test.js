const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, generate, mkdir, compare, expected } = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should allow for overriding the output path of favicons', async t => {
  const dist = path.join(t.context.root, 'dist');

  await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/public/path',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, outputPath: 'test/path' }),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'outputpathoption')), []);
});

test.afterEach(t => fs.remove(t.context.root));

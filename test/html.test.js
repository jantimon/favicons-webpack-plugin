const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../src');

const {logo, mkdir, generate, compare, expected} = require('./util');

test('should work together with the html-webpack-plugin', async t => {
  t.context.root = await mkdir();
  const dist = path.join(t.context.root, 'dist');
  const stats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({logo}),
    ],
  });

  const diff = await compare(dist, path.resolve(expected, 'html'));
  t.deepEqual(diff, []);
});

test.afterEach(t => fs.remove(t.context.root));

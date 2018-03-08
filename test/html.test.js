import test from 'ava';
import path from 'path';
import fs from 'fs-extra';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from '..';

import {logo, mkdir, generate, compare, expected} from './util';

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

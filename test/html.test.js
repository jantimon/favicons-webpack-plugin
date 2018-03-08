import test from 'ava';
import path from 'path';
import fs from 'fs-extra';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from '..';

import {logo, generate, compare, expected} from './util';

test('should work together with the html-webpack-plugin', async t => {
  const stats = await generate({
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({logo}),
    ],
  });

  t.context.dist = stats.compilation.compiler.outputPath;
  const diff = await compare(t.context.dist, path.resolve(expected, 'html'));
  t.deepEqual(diff, []);
});

test.afterEach(t => fs.remove(t.context.dist));

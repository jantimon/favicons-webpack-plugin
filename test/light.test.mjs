import test from 'ava';
import * as path from 'path';
import FaviconsWebpackPlugin from '../src/index.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {
  logo,
  withTempDirectory,
  generate,
  snapshotCompilationAssets,
} from './_util.mjs';

withTempDirectory(test);

test('should work if manual set to light mode', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, mode: 'light' }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should automatically pick up the dev mode from webpack', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    mode: 'development',
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/',
    },
    plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin({ logo })],
  });

  snapshotCompilationAssets(t, compilationStats);
});

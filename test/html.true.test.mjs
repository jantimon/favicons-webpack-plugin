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

test('should work together with the html-webpack-plugin', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin({ logo })],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should work together with the html-webpack-plugin with no <head></head> tags', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({ templateContent: '' }),
      new FaviconsWebpackPlugin({ logo }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

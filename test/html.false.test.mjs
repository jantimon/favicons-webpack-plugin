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

test('should allow disabling html injection', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, inject: false }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should respect HtmlWebpackPlugin@inject flag', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({ inject: false }),
      new FaviconsWebpackPlugin({ logo }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should respect HtmlWebpackPlugin@favicons flag', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({ favicons: false }),
      new FaviconsWebpackPlugin({ logo }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

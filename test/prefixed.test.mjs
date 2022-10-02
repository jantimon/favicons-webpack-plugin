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

test('should allow configuring the output prefix', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({
        logo,
        prefix: 'custom/prefix/[contenthash:8]/',
      }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should allow configuring the output prefix for light mode', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({
        logo,
        prefix: 'custom/prefix/[contenthash:8]/',
        mode: 'light',
      }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should allow configuring the output prefix with a fullhash', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({
        logo,
        prefix: 'custom/prefix/[fullhash:8]/',
      }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should allow configuring the output prefix for light mode with a fullhash', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({
        logo,
        prefix: 'custom/prefix/[fullhash:8]/',
        mode: 'light',
      }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

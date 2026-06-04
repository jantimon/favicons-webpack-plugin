import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import FaviconsWebpackPlugin from '../src/index.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {
  logo,
  generate,
  snapshotCompilationAssets,
  createTempDir,
  removeTempDir,
} from './_util.mjs';

describe('prefixed', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should allow configuring the output prefix', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
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

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should allow configuring the output prefix for light mode', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
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

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should allow configuring the output prefix with a fullhash', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
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

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should allow configuring the output prefix for light mode with a fullhash', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
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

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

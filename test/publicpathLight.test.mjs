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

describe('public path light', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should take the public path into account', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
        publicPath: '/public/path',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new FaviconsWebpackPlugin({ logo, mode: 'light' }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should work with an empty public path', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new FaviconsWebpackPlugin({ logo, mode: 'light' }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should work with an empty public path and a nested html file', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new HtmlWebpackPlugin({ filename: 'demo/index.html' }),
        new FaviconsWebpackPlugin({ logo, mode: 'light' }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

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

describe('light', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should work if manual set to light mode', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new FaviconsWebpackPlugin({ logo, mode: 'light' }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should automatically pick up the dev mode from webpack', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      mode: 'development',
      context: root,
      output: {
        path: dist,
        publicPath: '/',
      },
      plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin({ logo })],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

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

describe('html.false', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should allow disabling html injection', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new FaviconsWebpackPlugin({ logo, inject: false }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should respect HtmlWebpackPlugin@inject flag', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new HtmlWebpackPlugin({ inject: false }),
        new FaviconsWebpackPlugin({ logo }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should respect HtmlWebpackPlugin@favicons flag', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new HtmlWebpackPlugin({ favicons: false }),
        new FaviconsWebpackPlugin({ logo }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

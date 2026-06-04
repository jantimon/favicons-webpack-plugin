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

describe('unprefixed', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should correctly handle an empty prefix', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new FaviconsWebpackPlugin({ logo, prefix: '' }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

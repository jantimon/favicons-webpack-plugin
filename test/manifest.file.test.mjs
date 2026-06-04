import { describe, it, beforeEach, afterEach } from 'node:test';
import { join, resolve } from 'node:path';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  logo,
  generate,
  snapshotCompilationAssets,
  fixtures,
  createTempDir,
  removeTempDir,
} from './_util.mjs';

describe('manifest file', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should generate a result with custom manifest values', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new FaviconsWebpackPlugin({
          logo,
          manifest: resolve(fixtures, 'manifest.webmanifest'),
        }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

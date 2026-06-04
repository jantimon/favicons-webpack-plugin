import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  logo,
  generate,
  snapshotCompilationAssets,
  removeTempDir,
  createTempDir,
} from './_util.mjs';

describe('default', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should generate the expected default result', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [new FaviconsWebpackPlugin({ logo })],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

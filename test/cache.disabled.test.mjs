import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import { lstat } from 'node:fs/promises';
import FaviconsWebpackPlugin from '../src/index.js';
import getFolderSize from 'get-folder-size';
import {
  logo,
  generate,
  cacheBaseSize,
  createTempDir,
  removeTempDir,
} from './_util.mjs';

describe('cache.disabled', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should allow disabling caching', async (t) => {
    const dist = join(root, 'dist');
    const cache = join(root, '.cache');

    await generate({
      context: root,
      output: {
        path: dist,
      },
      cache: {
        type: 'filesystem',
        cacheDirectory: cache,
      },
      plugins: [new FaviconsWebpackPlugin({ logo, cache: false })],
    });

    t.assert.ok((await lstat(cache)).isDirectory());
    t.assert.ok((await getFolderSize(cache)).size < cacheBaseSize);
  });
});

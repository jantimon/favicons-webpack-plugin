import test from 'ava';
import * as path from 'path';
import { lstat } from 'fs/promises';
import FaviconsWebpackPlugin from '../src/index.js';
import getFolderSize from 'get-folder-size';
import { logo, withTempDirectory, generate, cacheBaseSize } from './_util.mjs';

withTempDirectory(test);

test('should allow disabling caching', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const cache = path.join(t.context.root, '.cache');

  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: cache,
    },
    plugins: [new FaviconsWebpackPlugin({ logo, cache: false })],
  });

  t.truthy((await lstat(cache)).isDirectory());
  t.truthy((await getFolderSize(cache)).size < cacheBaseSize);
});

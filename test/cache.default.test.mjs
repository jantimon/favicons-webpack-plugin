import test from 'ava';
import * as path from 'path';
import { lstat } from 'fs/promises';
import getFolderSize from 'get-folder-size';
import FaviconsWebpackPlugin from '../src/index.js';
import { logo, withTempDirectory, generate, cacheBaseSize } from './_util.mjs';

withTempDirectory(test);

test('should allow configuring cache directory', async (t) => {
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
    plugins: [new FaviconsWebpackPlugin({ logo, mode: 'webapp' })],
  });

  t.truthy((await lstat(cache)).isDirectory());
  t.truthy((await getFolderSize(cache)).size > cacheBaseSize);
});

test('should allow configuring cache directory for light mode', async (t) => {
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
    plugins: [new FaviconsWebpackPlugin({ logo, mode: 'light' })],
  });

  t.truthy((await lstat(cache)).isDirectory());
  t.truthy((await getFolderSize(cache)).size > cacheBaseSize);
});

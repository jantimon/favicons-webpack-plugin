const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const getFolderSize = require('util').promisify(require('get-folder-size'));

const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate, cacheBaseSize } = require('./_util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should allow configuring cache directory', async t => {
  const dist = path.join(t.context.root, 'dist');
  const cache = path.join(t.context.root, '.cache');

  await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: cache
    },
    plugins: [new FaviconsWebpackPlugin({ logo, mode: 'webapp' })]
  });

  t.truthy(fs.existsSync(cache));
  t.truthy(fs.lstatSync(cache).isDirectory());
  t.truthy((await getFolderSize(cache)) > cacheBaseSize);
});

test('should allow configuring cache directory for light mode', async t => {
  const dist = path.join(t.context.root, 'dist');
  const cache = path.join(t.context.root, '.cache');

  await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: cache
    },
    plugins: [new FaviconsWebpackPlugin({ logo, mode: 'light' })]
  });

  t.truthy(fs.existsSync(cache));
  t.truthy(fs.lstatSync(cache).isDirectory());
  t.truthy((await getFolderSize(cache)) > cacheBaseSize);
});

test.afterEach(t => fs.remove(t.context.root));

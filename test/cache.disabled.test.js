const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const getFolderSize = require('util').promisify(require('get-folder-size'));

const { logo, mkdir, generate, cacheBaseSize } = require('./_util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should allow disabling caching', async t => {
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
    plugins: [new FaviconsWebpackPlugin({ logo, cache: false })]
  });

  t.truthy((await getFolderSize(cache)) < cacheBaseSize);
});

test.afterEach(t => fs.remove(t.context.root));

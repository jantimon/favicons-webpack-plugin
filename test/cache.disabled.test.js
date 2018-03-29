const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const {logo, mkdir, generate} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should allow disabling caching', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [new FaviconsWebpackPlugin({logo, cache: false})],
  });

  t.deepEqual(fs.readdirSync(t.context.root), ['dist']);
});

test.afterEach(t => fs.remove(t.context.root));

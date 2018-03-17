const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../src');

const {logo, mkdir, generate} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should allow configuring cache directory', async t => {
  const dist = path.join(t.context.root, 'dist');
  const cache = path.join(t.context.root, 'cache');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [new FaviconsWebpackPlugin({logo, cache})],
  });

  t.deepEqual(fs.readdirSync(t.context.root).sort(), ['cache', 'dist']);
});

test.afterEach(t => fs.remove(t.context.root));

const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should allow configuring cache directory', async t => {
  const dist = path.join(t.context.root, 'dist');
  const cache = path.join(t.context.root, 'cache');

  await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [new FaviconsWebpackPlugin({ logo, cache })]
  });

  t.truthy(fs.existsSync(cache));
  t.truthy(fs.lstatSync(cache).isDirectory());
  t.truthy(fs.readdirSync(cache).length);
});

test.afterEach(t => fs.remove(t.context.root));

const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should cache assets', async t => {
  const plugin = new FaviconsWebpackPlugin({ logo });

  await generate({
    context: t.context.root,
    output: {
      path: path.join(t.context.root, 'dist')
    },
    plugins: [plugin]
  });

  const cache = path.resolve(t.context.root, '.wwp-cache');

  t.truthy(fs.existsSync(cache));
  t.truthy(fs.lstatSync(cache).isDirectory());
  t.truthy(fs.readdirSync(cache).length);
});

test.afterEach(t => fs.remove(t.context.root));

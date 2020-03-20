const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const findCacheDir = require('find-cache-dir');
const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should cache assets', async t => {
  const plugin = new FaviconsWebpackPlugin({ logo });

  await fs.writeJSON(path.join(t.context.root, 'package.json'), {});

  await generate({
    context: t.context.root,
    output: {
      path: path.join(t.context.root, 'dist')
    },
    plugins: [plugin]
  });

  const cache = findCacheDir({
    name: 'favicons-webpack-plugin',
    cwd: t.context.root
  });

  t.truthy(fs.existsSync(cache));
  t.truthy(fs.lstatSync(cache).isDirectory());
  t.truthy(fs.readdirSync(cache).length);
});

test.afterEach(t => fs.remove(t.context.root));

const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const {logo, mkdir, generate} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should cache assets', async t => {
  const plugin = new FaviconsWebpackPlugin({logo});
  await generate({
    context: t.context.root,
    output: {
      path: path.join(t.context.root, 'dist'),
    },
    plugins: [plugin],
  });

  const cache = path.relative(t.context.root, plugin.options.cache);
  t.deepEqual(fs.readdirSync(t.context.root).sort(), [cache, 'dist'].sort());
});

test.afterEach(t => fs.remove(t.context.root));

const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const {logo, generate, mkdir, compare, expected} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should allow configuring the output prefix', async t => {
  const dist = path.join(t.context.root, 'dist');
  const stats=  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [new FaviconsWebpackPlugin({logo, prefix: 'path/name-'})],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'prefixed')), []);
});

test.afterEach(t => fs.remove(t.context.root));

const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../src');

const {logo, generate, mkdir, compare, expected} = require('./util');

test('should generate the expected default result', async t => {
  t.context.root = await mkdir();
  const dist = path.join(t.context.root, 'dist');
  const stats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [new FaviconsWebpackPlugin({logo})]
  });

  const diff = await compare(dist, path.resolve(expected, 'default'));
  t.deepEqual(diff, []);
});

test.afterEach(t => fs.remove(t.context.root));

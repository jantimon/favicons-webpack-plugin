const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const { logo, generate, mkdir, snapshotCompilationAssets } = require('./_util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should generate a result with custom manifest values', async t => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [
      new FaviconsWebpackPlugin({
        logo,
        mode: 'light',
        manifest: {
          name: 'FaviconsDemo',
          short_name: 'FaviconsDemo',
          description: 'Just a demo',
          dir: 'auto',
          lang: 'en',
          display: 'standalone',
          background_color: '#fff',
          theme_color: '#fff',
          orientation: null
        }
      })
    ]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test.afterEach(t => fs.remove(t.context.root));

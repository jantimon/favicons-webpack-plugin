const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../');

const { logo, mkdir, generate, snapshotCompilationAssets } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should work without configuration', async t => {
  const dist = path.join(t.context.root, 'dist');
  fs.writeFileSync(
    path.join(t.context.root, 'logo.png'),
    fs.readFileSync(logo)
  );
  const compilationStats = await generate({
    mode: 'development',
    context: t.context.root,
    output: {
      path: dist
    },
    plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin()]
  });

  snapshotCompilationAssets(t, compilationStats);
});

test.afterEach(t => fs.remove(t.context.root));

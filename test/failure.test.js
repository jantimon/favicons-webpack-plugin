const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const {generate, mkdir, compare, expected} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should fail gracefully if path to logo is wrong', async t => {
  const dist = path.join(t.context.root, 'dist');
  const logo = path.join(t.context.root, 'logo.png');

  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist,
      },
      plugins: [new FaviconsWebpackPlugin({logo})]
    });
  } catch (err) {
    t.is(err.message, `Can't resolve '${logo}' in '${t.context.root}'`);
  }
});

test('should fail gracefully if the image stream is empty', async t => {
  const dist = path.join(t.context.root, 'dist');
  const logo = path.join(t.context.root, 'logo.png');

  await fs.writeFile(logo, '');

  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist,
      },
      plugins: [new FaviconsWebpackPlugin({logo})]
    });
  } catch (err) {
    t.is(err.message, 'No source provided');
  }
});

test('should fail gracefully if logo is not a valid image file', async t => {
  const dist = path.join(t.context.root, 'dist');
  const logo = path.join(t.context.root, 'logo.png');

  await fs.writeFile(logo, '?');

  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist,
      },
      plugins: [new FaviconsWebpackPlugin({logo})]
    });
  } catch (err) {
    t.is(err.message, 'Index out of range');
  }
});

test.afterEach(t => fs.remove(t.context.root));

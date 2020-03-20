const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const FaviconsWebpackPlugin = require('../');

const { empty, invalid, generate, mkdir } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should fail gracefully if path to logo is wrong', async t => {
  const dist = path.join(t.context.root, 'dist');
  const logo = path.join(t.context.root, 'missing.png');

  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist
      },
      plugins: [new FaviconsWebpackPlugin({ logo })]
    });
  } catch (err) {
    t.is(err.message, `Can't resolve '${logo}' in '${t.context.root}'`);
  }
});

test('should fail gracefully if the image stream is empty', async t => {
  const dist = path.join(t.context.root, 'dist');
  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist
      },
      plugins: [new FaviconsWebpackPlugin({ logo: empty })]
    });
  } catch (err) {
    t.is(err.message, 'Invalid image buffer');
  }
});

test('should fail gracefully if logo is not a valid image file', async t => {
  const dist = path.join(t.context.root, 'dist');
  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist
      },
      plugins: [new FaviconsWebpackPlugin({ logo: invalid })]
    });
  } catch (err) {
    t.is(err.message, 'Invalid image buffer');
  }
});

test.afterEach(t => fs.remove(t.context.root));

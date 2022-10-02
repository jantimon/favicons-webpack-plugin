import test from 'ava';
import * as path from 'path';
import FaviconsWebpackPlugin from '../src/index.js';
import { empty, invalid, generate, withTempDirectory } from './_util.mjs';

withTempDirectory(test);

test('should fail gracefully if path to logo is wrong', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const logo = path.join(t.context.root, 'missing.png');

  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist,
      },
      plugins: [new FaviconsWebpackPlugin({ logo })],
    });
  } catch (err) {
    t.is(err.message, `ENOENT: no such file or directory, open '${logo}'`);
  }
});

test('should fail gracefully if the image stream is empty', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist,
      },
      plugins: [new FaviconsWebpackPlugin({ logo: empty })],
    });
  } catch (err) {
    const errorMessage = err.message;
    t.is(errorMessage, 'Invalid image buffer');
  }
});

test('should fail gracefully if logo is not a valid image file', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  try {
    await generate({
      context: t.context.root,
      output: {
        path: dist,
      },
      plugins: [new FaviconsWebpackPlugin({ logo: invalid })],
    });
  } catch (err) {
    const errorMessage = err.message;
    t.is(errorMessage, 'Invalid image buffer');
  }
});

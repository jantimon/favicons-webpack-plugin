import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  empty,
  invalid,
  generate,
  createTempDir,
  removeTempDir,
} from './_util.mjs';

describe('default', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should fail gracefully if path to logo is wrong', async (t) => {
    const dist = join(root, 'dist');
    const logo = join(root, 'missing.png');

    await t.assert.rejects(
      () =>
        generate({
          context: root,
          output: {
            path: dist,
          },
          plugins: [new FaviconsWebpackPlugin({ logo })],
        }),
      { message: `ENOENT: no such file or directory, open '${logo}'` },
    );
  });

  it('should fail gracefully if the image stream is empty', async (t) => {
    const dist = join(root, 'dist');

    await t.assert.rejects(
      () =>
        generate({
          context: root,
          output: {
            path: dist,
          },
          plugins: [new FaviconsWebpackPlugin({ logo: empty })],
        }),
      { message: 'Invalid image buffer' },
    );
  });

  it('should fail gracefully if logo is not a valid image file', async (t) => {
    const dist = join(root, 'dist');

    await t.assert.rejects(
      () =>
        generate({
          context: root,
          output: {
            path: dist,
          },
          plugins: [new FaviconsWebpackPlugin({ logo: invalid })],
        }),
      { message: 'Invalid image buffer' },
    );
  });
});

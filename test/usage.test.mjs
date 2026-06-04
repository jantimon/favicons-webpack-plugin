import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  logo,
  generate,
  snapshotCompilationAssets,
  createTempDir,
  removeTempDir,
} from './_util.mjs';

describe('usage', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should take a string as argument', async (t) => {
    const output = join(root, 'output');

    const compilationStats = await generate({
      output: {
        path: output,
      },
      plugins: [new FaviconsWebpackPlugin(logo)],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should take an object with just the logo as argument', async (t) => {
    const output = join(root, 'output');

    const compilationStats = await generate({
      output: {
        path: output,
      },
      plugins: [new FaviconsWebpackPlugin({ logo })],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

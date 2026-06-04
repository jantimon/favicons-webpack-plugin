import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import FaviconsWebpackPlugin from '../src/index.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {
  logo,
  generate,
  snapshotCompilationAssets,
  createTempDir,
  removeTempDir,
} from './_util.mjs';

describe('html.true', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should work together with the html-webpack-plugin', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin({ logo })],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });

  it('should work together with the html-webpack-plugin with no <head></head> tags', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new HtmlWebpackPlugin({ templateContent: '' }),
        new FaviconsWebpackPlugin({ logo }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import FaviconsWebpackPlugin from '../src/index.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {
  logo,
  generate,
  snapshotCompilationAssets,
  removeTempDir,
  createTempDir,
} from './_util.mjs';

describe('public path option', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should allow for overriding the publicPath option', async (t) => {
    const dist = join(root, 'dist');

    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
        publicPath: '/public/path',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new FaviconsWebpackPlugin({ logo, publicPath: '/another/path' }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

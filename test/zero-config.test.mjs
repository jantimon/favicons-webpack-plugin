import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import { writeFile, readFile } from 'fs/promises';
import FaviconsWebpackPlugin from '../src/index.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {
  logo,
  generate,
  snapshotCompilationAssets,
  createTempDir,
  removeTempDir,
} from './_util.mjs';

describe('zero-config', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should work without configuration', async (t) => {
    const dist = join(root, 'dist');
    await writeFile(join(root, 'logo.png'), await readFile(logo));
    const compilationStats = await generate({
      mode: 'development',
      context: root,
      output: {
        path: dist,
        publicPath: '/',
      },
      plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin()],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

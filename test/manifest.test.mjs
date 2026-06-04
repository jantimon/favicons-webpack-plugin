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

describe('manifest', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

  it('should generate a result with custom manifest values', async (t) => {
    const dist = join(root, 'dist');
    const compilationStats = await generate({
      context: root,
      output: {
        path: dist,
      },
      plugins: [
        new FaviconsWebpackPlugin({
          logo,
          manifest: {
            name: 'FaviconsDemo',
            short_name: 'FaviconsDemo',
            description: 'Just a demo',
            dir: 'auto',
            lang: 'en',
            display: 'standalone',
            background_color: '#fff',
            theme_color: '#fff',
            orientation: null,
          },
        }),
      ],
    });

    t.assert.snapshot(snapshotCompilationAssets(compilationStats));
  });
});

import test from 'ava';
import * as path from 'path';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  logo,
  withTempDirectory,
  generate,
  snapshotCompilationAssets,
  fixtures,
} from './_util.mjs';

withTempDirectory(test);

test('should generate a result with custom manifest values', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new FaviconsWebpackPlugin({
        logo,
        manifest: path.resolve(fixtures, 'manifest.webmanifest'),
      }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

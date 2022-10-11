import test from 'ava';
import * as path from 'path';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  logo,
  generate,
  withTempDirectory,
  snapshotCompilationAssets,
} from './_util.mjs';

withTempDirectory(test);

test('should work with logo array', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [new FaviconsWebpackPlugin({ logo: [logo] })],
  });

  snapshotCompilationAssets(t, compilationStats);
});

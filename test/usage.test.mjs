import * as path from 'path';
import test from 'ava';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  logo,
  generate,
  withTempDirectory,
  snapshotCompilationAssets,
} from './_util.mjs';

withTempDirectory(test);

test('should take a string as argument', async (t) => {
  const output = path.join(t.context.root, 'output');

  const compilationStats = await generate({
    output: {
      path: output,
    },
    plugins: [new FaviconsWebpackPlugin(logo)],
  });

  snapshotCompilationAssets(t, compilationStats);
});

test('should take an object with just the logo as argument', async (t) => {
  const output = path.join(t.context.root, 'output');

  const compilationStats = await generate({
    output: {
      path: output,
    },
    plugins: [new FaviconsWebpackPlugin({ logo })],
  });

  snapshotCompilationAssets(t, compilationStats);
});

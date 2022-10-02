import test from 'ava';
import * as path from 'path';
import { writeFile, readFile } from 'fs/promises';
import FaviconsWebpackPlugin from '../src/index.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {
  logo,
  withTempDirectory,
  generate,
  snapshotCompilationAssets,
} from './_util.mjs';

withTempDirectory(test);

test('should work without configuration', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  await writeFile(path.join(t.context.root, 'logo.png'), await readFile(logo));
  const compilationStats = await generate({
    mode: 'development',
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/',
    },
    plugins: [new HtmlWebpackPlugin(), new FaviconsWebpackPlugin()],
  });

  snapshotCompilationAssets(t, compilationStats);
});

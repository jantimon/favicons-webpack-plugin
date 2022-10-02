import test from 'ava';
import * as path from 'path';
import FaviconsWebpackPlugin from '../src/index.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {
  logo,
  withTempDirectory,
  generate,
  snapshotCompilationAssets,
} from './_util.mjs';

withTempDirectory(test);

test('should allow for overriding the output path of favicons', async (t) => {
  const dist = path.join(t.context.root, 'dist');

  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
      publicPath: '/public/path',
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new FaviconsWebpackPlugin({ logo, outputPath: 'test/path' }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

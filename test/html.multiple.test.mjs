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

test('should allow handling multiple html-webpack-plugin', async (t) => {
  const dist = path.join(t.context.root, 'dist');
  const compilationStats = await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'a.html',
      }),
      new HtmlWebpackPlugin({
        filename: 'b.html',
      }),
      new FaviconsWebpackPlugin({
        logo,
        inject: (htmlPlugin) => htmlPlugin.options.filename === 'a.html',
      }),
    ],
  });

  snapshotCompilationAssets(t, compilationStats);
});

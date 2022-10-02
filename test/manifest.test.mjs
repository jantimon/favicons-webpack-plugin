import test from 'ava';
import * as path from 'path';
import FaviconsWebpackPlugin from '../src/index.js';
import {
  logo,
  withTempDirectory,
  generate,
  snapshotCompilationAssets,
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

  snapshotCompilationAssets(t, compilationStats);
});

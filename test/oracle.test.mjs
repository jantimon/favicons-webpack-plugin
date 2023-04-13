import test from 'ava';
import * as path from 'path';
import { mkdir, writeFile, readFile } from 'fs/promises';
import FaviconsWebpackPlugin from '../src/index.js';
import { logo, withTempDirectory, generate } from './_util.mjs';

withTempDirectory(test);

async function writeJson(path, obj) {
  const content = JSON.stringify(obj, null, 2);
  await writeFile(path, content);
}

async function readJson(path) {
  const content = await readFile(path);
  return JSON.parse(content);
}

const pkg = {
  name: 'app',
  version: '1.2.3',
  description: 'Some App',
  author: {
    name: 'Jane Doe',
    email: 'jane@doe.com',
    url: 'https://jane.doe.com',
  },
};

test('should infer missing information from the nearest parent package.json', async (t) => {
  const context = path.join(t.context.root, 'a', 'b', 'c', 'd');
  const output = path.join(t.context.root, 'output');

  await mkdir(context, { recursive: true });
  await writeJson(path.join(t.context.root, 'package.json'), pkg);

  {
    await generate({
      context,
      output: {
        path: output,
      },
      plugins: [new FaviconsWebpackPlugin(logo)],
    });

    const manifest = await readJson(
      path.join(output, 'assets', 'manifest.webmanifest')
    );

    t.is(manifest.name, 'app');
    t.is(manifest.description, 'Some App');
  }

  {
    await writeJson(path.join(context, 'package.json'), {});
    await generate({
      context,
      output: {
        path: output,
      },
      plugins: [new FaviconsWebpackPlugin(logo)],
    });

    const manifest = await readJson(
      path.join(output, 'assets', 'manifest.webmanifest')
    );

    t.is(manifest.name, undefined);
    t.is(manifest.description, undefined);
  }
});

test('should handle missing package.json gracefully', async (t) => {
  const output = path.join(t.context.root, 'output');

  await generate({
    context: t.context.root,
    output: {
      path: output,
    },
    plugins: [new FaviconsWebpackPlugin(logo)],
  });

  const manifest = await readJson(
    path.join(output, 'assets', 'manifest.webmanifest')
  );

  t.is(manifest.name, undefined);
  t.is(manifest.description, undefined);
});

test('should not reach for the package.json if metadata defined', async (t) => {
  await writeJson(path.join(t.context.root, 'package.json'), pkg);

  const output = path.join(t.context.root, 'output');

  const favicons = {
    appName: 'another-app',
    appDescription: null,
  };

  await generate({
    context: t.context.root,
    output: {
      path: output,
    },
    plugins: [new FaviconsWebpackPlugin({ logo, favicons })],
  });

  const manifest = await readJson(
    path.join(output, 'assets', 'manifest.webmanifest')
  );

  t.is(manifest.name, 'another-app');
  t.is(manifest.description, undefined);
});

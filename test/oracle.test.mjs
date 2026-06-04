import { describe, it, beforeEach, afterEach } from 'node:test';
import { join } from 'node:path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import FaviconsWebpackPlugin from '../src/index.js';
import { logo, generate, createTempDir, removeTempDir } from './_util.mjs';

describe('oracle', () => {
  let root;
  beforeEach(async (c) => {
    root = await createTempDir(c.fullName);
  });
  afterEach(async () => {
    await removeTempDir(root);
  });

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

  it('should infer missing information from the nearest parent package.json', async (t) => {
    const context = join(root, 'a', 'b', 'c', 'd');
    const output = join(root, 'output');

    await mkdir(context, { recursive: true });
    await writeJson(join(root, 'package.json'), pkg);

    {
      await generate({
        context,
        output: {
          path: output,
        },
        plugins: [new FaviconsWebpackPlugin(logo)],
      });

      const manifest = await readJson(
        join(output, 'assets', 'manifest.webmanifest'),
      );

      t.assert.equal(manifest.name, 'app');
      t.assert.equal(manifest.description, 'Some App');
    }

    {
      await writeJson(join(context, 'package.json'), {});
      await generate({
        context,
        output: {
          path: output,
        },
        plugins: [new FaviconsWebpackPlugin(logo)],
      });

      const manifest = await readJson(
        join(output, 'assets', 'manifest.webmanifest'),
      );

      t.assert.strictEqual(manifest.name, undefined);
      t.assert.strictEqual(manifest.description, undefined);
    }
  });

  it('should handle missing package.json gracefully', async (t) => {
    const output = join(root, 'output');

    await generate({
      context: root,
      output: {
        path: output,
      },
      plugins: [new FaviconsWebpackPlugin(logo)],
    });

    const manifest = await readJson(
      join(output, 'assets', 'manifest.webmanifest'),
    );

    t.assert.strictEqual(manifest.name, undefined);
    t.assert.strictEqual(manifest.description, undefined);
  });

  it('should not reach for the package.json if metadata defined', async (t) => {
    await writeJson(join(root, 'package.json'), pkg);

    const output = join(root, 'output');

    const favicons = {
      appName: 'another-app',
      appDescription: null,
    };

    await generate({
      context: root,
      output: {
        path: output,
      },
      plugins: [new FaviconsWebpackPlugin({ logo, favicons })],
    });

    const manifest = await readJson(
      join(output, 'assets', 'manifest.webmanifest'),
    );

    t.assert.strictEqual(manifest.name, 'another-app');
    t.assert.strictEqual(manifest.description, undefined);
  });
});

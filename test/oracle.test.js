const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const parseAuthor = require('parse-author');
const FaviconsWebpackPlugin = require('../src');

const { logo, mkdir, compiler } = require('./util');

test.beforeEach(async t => (t.context.root = await mkdir()));

test('should infer missing information from the nearest parent package.json', async t => {
  const pkg = {
    name: 'app',
    version: '1.2.3',
    description: 'Some App',
    author: {
      name: 'Jane Doe',
      email: 'jane@doe.com',
      url: 'https://jane.doe.com'
    }
  };

  const context = path.join(t.context.root, 'a', 'b', 'c', 'd');

  await fs.ensureDir(context);
  await fs.writeJSON(path.join(t.context.root, 'package.json'), pkg, {
    spaces: 2
  });

  {
    const plugin = new FaviconsWebpackPlugin(logo);
    plugin.apply(compiler({ context }));

    t.is(plugin.options.favicons.appName, pkg.name);
    t.is(plugin.options.favicons.version, pkg.version);
    t.is(plugin.options.favicons.appDescription, pkg.description);
    t.is(plugin.options.favicons.developerName, pkg.author.name);
    t.is(plugin.options.favicons.developerURL, pkg.author.url);
  }

  await fs.writeJSON(path.join(context, 'package.json'), {}, { spaces: 2 });

  {
    const plugin = new FaviconsWebpackPlugin(logo);
    plugin.apply(compiler({ context }));

    t.is(plugin.options.favicons.appName, undefined);
    t.is(plugin.options.favicons.version, undefined);
    t.is(plugin.options.favicons.appDescription, undefined);
    t.is(plugin.options.favicons.developerName, undefined);
    t.is(plugin.options.favicons.developerURL, undefined);
  }
});

test('should parse author string from package.json', async t => {
  const pkg = { author: 'John Doe <john@doe.com> (https://john.doe.com)' };

  await fs.writeJSON(path.join(t.context.root, 'package.json'), pkg, {
    spaces: 2
  });

  const plugin = new FaviconsWebpackPlugin(logo);
  plugin.apply(
    compiler({
      context: t.context.root
    })
  );

  t.is(plugin.options.favicons.developerName, parseAuthor(pkg.author).name);
  t.is(plugin.options.favicons.developerURL, parseAuthor(pkg.author).url);
});

test('should handle missing package.json gracefully', async t => {
  const plugin = new FaviconsWebpackPlugin(logo);
  plugin.apply(
    compiler({
      context: t.context.root
    })
  );

  t.is(plugin.options.favicons.appName, undefined);
  t.is(plugin.options.favicons.version, undefined);
  t.is(plugin.options.favicons.appDescription, undefined);
  t.is(plugin.options.favicons.developerName, undefined);
  t.is(plugin.options.favicons.developerURL, undefined);
});

test('should not reach for the package.json if metadata defined', async t => {
  const pkg = {
    name: 'app',
    version: '1.2.3',
    description: 'Some App',
    author: {
      name: 'Jane Doe',
      email: 'jane@doe.com',
      url: 'https://jane.doe.com'
    }
  };

  await fs.writeJSON(path.join(t.context.root, 'package.json'), pkg, {
    spaces: 2
  });

  const favicons = {
    appName: null,
    version: null,
    appDescription: null,
    developerName: null,
    developerURL: null
  };

  const plugin = new FaviconsWebpackPlugin({ logo, favicons });
  plugin.apply(
    compiler({
      context: t.context.root
    })
  );

  t.is(plugin.options.favicons.appName, null);
  t.is(plugin.options.favicons.version, null);
  t.is(plugin.options.favicons.appDescription, null);
  t.is(plugin.options.favicons.developerName, null);
  t.is(plugin.options.favicons.developerURL, null);
});

test.afterEach(t => fs.remove(t.context.root));

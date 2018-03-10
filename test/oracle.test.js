const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const parseAuthor = require('parse-author');
const FaviconsWebpackPlugin = require('../src');

const {logo, mkdir, compiler} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should infer missing information from the nearest parent package.json', async t => {
  const pkg = {
    "name": "app",
    "version": "1.2.3",
    "description": "Some App",
    "author": {
      "name" : "Jane Doe",
      "email" : "jane@doe.com",
      "url" : "https://jane.doe.com"
    }
  };

  const context = path.join(t.context.root, 'a', 'b', 'c', 'd');

  await fs.ensureDir(context);
  await fs.writeJSON(path.join(t.context.root, 'package.json'), pkg, {spaces: 2});

  {
    const plugin = new FaviconsWebpackPlugin(logo);
    plugin.apply(compiler({context}));

    t.is(plugin.options.favicons.appName, pkg.name);
    t.is(plugin.options.favicons.version, pkg.version);
    t.is(plugin.options.favicons.appDescription, pkg.description);
    t.is(plugin.options.favicons.developerName, pkg.author.name);
    t.is(plugin.options.favicons.developerURL, pkg.author.url);
  }

  await fs.writeJSON(path.join(context, 'package.json'), {}, {spaces: 2});

  {
    const plugin = new FaviconsWebpackPlugin(logo);
    plugin.apply(compiler({context}));

    t.is(plugin.options.favicons.appName, undefined);
    t.is(plugin.options.favicons.version, undefined);
    t.is(plugin.options.favicons.appDescription, undefined);
    t.is(plugin.options.favicons.developerName, undefined);
    t.is(plugin.options.favicons.developerURL, undefined);
  }

});

test('should parse author string from package.json', async t => {
  const pkg = {"author": "John Doe <john@doe.com> (https://john.doe.com)"};

  await fs.writeJSON(path.join(t.context.root, 'package.json'), pkg, {spaces: 2});

  const plugin = new FaviconsWebpackPlugin(logo);
  plugin.apply(compiler({
    context: t.context.root,
  }));

  t.is(plugin.options.favicons.developerName, parseAuthor(pkg.author).name);
  t.is(plugin.options.favicons.developerURL, parseAuthor(pkg.author).url);
});

test('should handle missing package.json gracefully', async t => {
  const plugin = new FaviconsWebpackPlugin(logo);
  plugin.apply(compiler({
    context: t.context.root,
  }));

  t.is(plugin.options.favicons.appName, undefined);
  t.is(plugin.options.favicons.version, undefined);
  t.is(plugin.options.favicons.appDescription, undefined);
  t.is(plugin.options.favicons.developerName, undefined);
  t.is(plugin.options.favicons.developerURL, undefined);
});

test('should not reach for the package.json if no metadata is missing', async t => {
  const pkg = {
    "name": "app",
    "version": "1.2.3",
    "description": "Some App",
    "author": {
      "name" : "Jane Doe",
      "email" : "jane@doe.com",
      "url" : "https://jane.doe.com"
    }
  };

  await fs.writeJSON(path.join(t.context.root, 'package.json'), pkg, {spaces: 2});

  const meta = {
    appName: 'pwa',
    version: '0.1.2',
    appDescription: 'Progressive Web App',
    developerName: 'John Doe',
    developerURL: 'https://john.doe.com',
  };

  const plugin = new FaviconsWebpackPlugin({logo, favicons: Object.assign({}, meta)});
  plugin.apply(compiler({
    context: t.context.root,
  }));

  t.is(plugin.options.favicons.appName, meta.appName);
  t.is(plugin.options.favicons.version, meta.version);
  t.is(plugin.options.favicons.appDescription, meta.appDescription);
  t.is(plugin.options.favicons.developerName, meta.developerName);
  t.is(plugin.options.favicons.developerURL, meta.developerURL);
});

test.afterEach(t => fs.remove(t.context.root));
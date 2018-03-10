const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const parseAuthor = require('parse-author');
const FaviconsWebpackPlugin = require('../src');

const {logo, mkdir, compiler} = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should infer missing information from the nearest package.json', async t => {
  const pkg = {
    "name": "mock",
    "version": "1.2.3",
    "description": "A mock package.json",
    "author": {
      "name" : "Jane Doe",
      "email" : "jane@doe.com",
      "url" : "https://jane.doe.com"
    }
  };

  await fs.writeJSON(path.join(t.context.root, 'package.json'), pkg, {spaces: 2});

  const plugin = new FaviconsWebpackPlugin(logo);
  plugin.apply(compiler({
    context: t.context.root,
  }));

  t.is(plugin.options.favicons.appName, pkg.name);
  t.is(plugin.options.favicons.version, pkg.version);
  t.is(plugin.options.favicons.appDescription, pkg.description);
  t.is(plugin.options.favicons.developerName, pkg.author.name);
  t.is(plugin.options.favicons.developerURL, pkg.author.url);
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

test('should not attempt to parse package.json if no information is missing', async t => {
  await fs.writeFile(path.join(t.context.root, 'package.json'), 'invalid json');

  const favicons = {
    appName: 'app',
    version: '0.1.2',
    appDescription: 'an awesome app',
    developerName: 'Max Mustermann',
    developerURL: 'https://m.m.com',
  };

  const plugin = new FaviconsWebpackPlugin({logo, favicons});
  plugin.apply(compiler({
    context: t.context.root,
  }));

  t.is(plugin.options.favicons.appName, favicons.appName);
  t.is(plugin.options.favicons.version, favicons.version);
  t.is(plugin.options.favicons.appDescription, favicons.appDescription);
  t.is(plugin.options.favicons.developerName, favicons.developerName);
  t.is(plugin.options.favicons.developerURL, favicons.developerURL);
});

test.afterEach(t => fs.remove(t.context.root));
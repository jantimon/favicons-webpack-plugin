const test = require('ava');
const FaviconsWebpackPlugin = require('../');

const { logo } = require('./util');

test('should take a string as argument', t => {
  const plugin = new FaviconsWebpackPlugin(logo);
  t.is(plugin.options.logo, logo);
});

test('should take an object with just the logo as argument', t => {
  const plugin = new FaviconsWebpackPlugin({ logo });
  t.is(plugin.options.logo, logo);
});

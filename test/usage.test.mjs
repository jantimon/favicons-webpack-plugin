import test from 'ava';
import FaviconsWebpackPlugin from '../src/index.js';
import { logo } from './_util.mjs';

test('should take a string as argument', (t) => {
  const plugin = new FaviconsWebpackPlugin(logo);
  t.is(plugin.options.logo, logo);
});

test('should take an object with just the logo as argument', (t) => {
  const plugin = new FaviconsWebpackPlugin({ logo });
  t.is(plugin.options.logo, logo);
});

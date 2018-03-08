import test from 'ava';
import FaviconsWebpackPlugin from '..';

import {logo, mkdir} from './util';

test('should throw error when instantiated without a logo', t => {
  try {
    new FaviconsWebpackPlugin();
  } catch (err) {
    t.is(err.message, 'FaviconsWebpackPlugin options are required');
  }

  try {
    new WebappWebpackPlugin({});
  } catch (err) {
    t.is(err.message, 'An input file is required');
  }
});

test('should take a string as argument', t => {
  const plugin = new FaviconsWebpackPlugin(logo);
  t.is(plugin.options.logo, logo);
});

test('should take an object with just the logo as argument', t => {
  const plugin = new FaviconsWebpackPlugin({logo});
  t.is(plugin.options.logo, logo);
});

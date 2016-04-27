/*
 * Integration and unit tests for all features but caching
 */

/* eslint-env jasmine */
'use strict';

// Workaround for css-loader issue
// https://github.com/webpack/css-loader/issues/144
if (!global.Promise) {
  require('es6-promise').polyfill();
}

var path = require('path');
// var fs = require('fs');
var webpack = require('webpack');
var rm_rf = require('rimraf');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var FaviconsWebpackPlugin = require('../index.js');

var OUTPUT_DIR = path.join(__dirname, '../dist');
var DEFAULT_OPTIONS = {
  logo: path.join(__dirname, 'fixtures/logo.png'),
  persistentCache: true,
  inject: true,
  icons: {
    android: false,
    appleIcon: false,
    appleStartup: false,
    coast: false,
    favicons: true,
    firefox: false,
    opengraph: false,
    twitter: false,
    yandex: false,
    windows: false
  }
};

// extend jasmine timeouts for slow processing
var timeout = (typeof v8debug === 'object') ? 600000 : 5000;
jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;

function test (description, webpackConfig, done) {
  var start = Date.now();
  webpack(webpackConfig, function (err, stats) {
    var end = Date.now();
    expect(err).toBeFalsy();
    console.log('TEST COMPLETE : ' + description + ' : ' + end - start + 'ms');
  });
}

describe('FaviconWebpackPlugin', function () {
  beforeEach(function (done) {
    rm_rf(OUTPUT_DIR, done);
  });

  it('works without caching', function (done) {
    var options = Object.assign({}, DEFAULT_OPTIONS, {persistentCache: false});
    test(
      'no caching',
      {
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_DIR
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new FaviconsWebpackPlugin(options)
        ]
      },
      done);
  });
});

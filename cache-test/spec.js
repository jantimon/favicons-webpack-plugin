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
var fs = require('fs');
var webpack = require('webpack');
var rm_rf = require('rimraf');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var FaviconsWebpackPlugin = require('../index.js');
var dirCompare = require('dir-compare');

var ROOT_DIR = path.join(__dirname, '../');
var OUTPUT_DIR = path.join(ROOT_DIR, 'dist');
var CACHE_DIR = path.join(ROOT_DIR, '.cache');

var WEBPACK_OPTIONS = {
  entry: path.join(__dirname, 'fixtures/index.js'),
  output: {
    path: OUTPUT_DIR
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
};

var FAVICON_OPTIONS = {
  logo: path.join(__dirname, 'fixtures/logo.png'),
  prefix: 'icons/',
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

var COMPARE_OPTIONS = {
  compareSize: true,
  compareContents: true,
  noDiffSet: true
};

// extend jasmine timeouts for slow processing
var timeout = (typeof v8debug === 'object') ? 600000 : 5000;
jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;

function test (description, webpackConfig, expectedDist, expectedCache, done) {
  var start = Date.now();
  webpack(webpackConfig, function (err, stats) {
    var duration = Date.now() - start;
    if (err) {
      fail('Webpack error: ' + err);
      return done();
    }
    Promise.all([
      makeDirComparePromise(expectedDist, OUTPUT_DIR),
      makeDirComparePromise(expectedCache, CACHE_DIR)
    ]).then(function () {
      var msg = 'TEST COMPLETE : ' + description + ' : ' + duration + 'ms';
      console.log(msg);
      done();
    }).catch(function (err) {
      console.err(err);
      done();
    });
  });
}

function createWebpackOptions (faviconOptions) {
  faviconOptions = Object.assign({}, FAVICON_OPTIONS, faviconOptions);
  var faviconsPlugin = new FaviconsWebpackPlugin(faviconOptions);
  var webpackOptions = Object.assign({}, WEBPACK_OPTIONS);
  webpackOptions.plugins.push(faviconsPlugin);
  return webpackOptions;
}

function makeDirDeletePromise (dir) {
  return new Promise(function (resolve, reject) {
    rm_rf(dir, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

function makeDirComparePromise (expected, actual) {
  if (expected) {
    return dirCompare.compare(expected, actual, COMPARE_OPTIONS).then(function (compareResult) {
      if (compareResult.same) {
        Promise.resolve();
      } else {
        expected = expected.slice(ROOT_DIR.length);
        actual = actual.slice(ROOT_DIR.length);
        fail('Actual directory "' + actual + '" different to expected directory "' + expected + '"');
        Promise.reject();
      }
    });
  } else {
    return new Promise(function (resolve, reject) {
      fs.access(actual, fs.F_OK, function (err) {
        if (err) {
          resolve();
        } else {
          actual = actual.slice(ROOT_DIR.length);
          fail('Expected directory "' + actual + '" not to exist');
          reject();
        }
      });
    });
  }
}

function chainPromises (promises) {
  return promises.reduce(function (chain, promise) {
    return chain.then(function () {
      return promise;
    });
  }, Promise.resolve());
}

function deleteDirs (dirs, done) {
  chainPromises(dirs.map(makeDirDeletePromise))
  .then(done);
}

describe('FaviconWebpackPlugin', function () {
  it('works without caching', function (done) {
    deleteDirs([OUTPUT_DIR, CACHE_DIR], function () {
      test(
        'works without caching',
        createWebpackOptions({
          persistentCache: false
        }),
        path.resolve(__dirname, 'fixtures/expected/default-dist'),
        null,
        done);
    });
  });
  it('works with empty cache', function (done) {
    deleteDirs([OUTPUT_DIR, CACHE_DIR], function () {
      test(
        'works with empty cache',
        createWebpackOptions(),
        path.resolve(__dirname, 'fixtures/expected/default-dist'),
        path.resolve(__dirname, 'fixtures/expected/default-cache'),
        done);
    });
  });
});

// addititonal tests:
// missing logo file
// [hash] in prefix and stats file
// different logo option ouputs - adds/removes

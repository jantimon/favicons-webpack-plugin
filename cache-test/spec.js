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
var format = require('util').format;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var FaviconsWebpackPlugin = require('../index.js');
var dirCompare = require('dir-compare');
var makePromise = require('denodeify');
var deleteDir = makePromise(require('rimraf'));
var runWebpack = makePromise(require('webpack'));

var ROOT_DIR = path.join(__dirname, '../');
var OUTPUT_DIR = path.join(ROOT_DIR, 'dist');
var CACHE_DIR = path.join(ROOT_DIR, '.cache');

var WEBPACK_OPTIONS = {
  entry: path.join(__dirname, 'fixtures/index.js'),
  output: {
    path: OUTPUT_DIR
  },
  plugins: [
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
  compareContents: true
};

var COMPARISON_STATES = {
  'equal': '==',
  'left': '->',
  'right': '<-',
  'distinct': '<>'
};

// extend jasmine timeouts for slow processing
var timeout = (typeof v8debug === 'object') ? 600000 : 5000;
jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;

function test (description, webpackConfig, expectedDist, expectedCache) {
  var recordDuration = startTiming(description);
  return runWebpack(webpackConfig)
    .then(recordDuration)
    .then(function () {
      return Promise.all([
        makeDirComparePromise(expectedDist, OUTPUT_DIR),
        makeDirComparePromise(expectedCache, CACHE_DIR)
      ]);
    })
    .catch(function (err) {
      fail(err);
      throw err;
    });
}

function startTiming (description, start) {
  start = start || Date.now();
  return function () {
    var duration = Date.now() - start;
    var msg = 'RUN COMPLETE : ' + description + ' : ' + duration + 'ms';
    console.log(msg);
    return Promise.resolve();
  };
}

function makeDirComparePromise (expected, actual) {
  if (expected) {
    return dirCompare.compare(expected, actual, COMPARE_OPTIONS).then(function (compareResult) {
      if (!compareResult.same) {
        fail(detailDirectoryDifferences(expected, actual, compareResult));
      }
    });
  } else {
    // no directory should exist
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

function detailDirectoryDifferences (expected, actual, compareResult) {
  var output = [];
  expected = expected.slice(ROOT_DIR.length);
  actual = actual.slice(ROOT_DIR.length);
  output.push('Actual directory "' + actual + '" different to expected directory "' + expected + '":');
  output.push('equal: ' + compareResult.equal);
  output.push('distinct: ' + compareResult.distinct);
  output.push('expected: ' + compareResult.left);
  output.push('actual: ' + compareResult.right);
  output.push('differences: ' + compareResult.differences);
  output.push('same: ' + compareResult.same);
  compareResult.diffSet.forEach(function (entry) {
    var state = COMPARISON_STATES[entry.state];
    var name1 = entry.name1 ? entry.name1 : '';
    var name2 = entry.name2 ? entry.name2 : '';
    output.push(format('%s(%s)%s%s(%s)', name1, entry.type1, state, name2, entry.type2));
  });
  return output.join('\n');
}

function createWebpackOptions (includeHtml, faviconOptions) {
  var webpackOptions = Object.assign({}, WEBPACK_OPTIONS);
  webpackOptions.plugins = [];
  if (includeHtml) {
    webpackOptions.plugins.push(new HtmlWebpackPlugin());
  }
  faviconOptions = Object.assign({}, FAVICON_OPTIONS, faviconOptions);
  webpackOptions.plugins.push(new FaviconsWebpackPlugin(faviconOptions));
  return webpackOptions;
}

function deleteDirs (dirs, done) {
  Promise.all(dirs.map(function (dir) {
    return deleteDir(dir);
  }))
  .then(done)
  .catch(done);
}

/*
 * TESTS START HERE
 */
describe('FaviconWebpackPlugin', function () {
  beforeEach(function (done) {
    deleteDirs([OUTPUT_DIR, CACHE_DIR], done);
  });

  it('works without caching', function (done) {
    test(
      'works without caching',
      createWebpackOptions(false, {persistentCache: false}),
      path.resolve(__dirname, 'fixtures/expected/default-dist'),
      null
    )
    .then(done)
    .catch(done);
  });

  it('works with html without caching', function (done) {
    test(
      'works with html without caching',
      createWebpackOptions(true, {persistentCache: false}, true),
      path.resolve(__dirname, 'fixtures/expected/default-dist-with-html'),
      null
    )
    .then(done)
    .catch(done);
  });

  it('works with empty cache', function (done) {
    test(
      'works with empty cache',
      createWebpackOptions(),
      path.resolve(__dirname, 'fixtures/expected/default-dist'),
      path.resolve(__dirname, 'fixtures/expected/default-cache')
    )
    .then(done)
    .catch(done);
  });

  it('works with html with empty cache', function (done) {
    test(
      'works with html with empty cache',
      createWebpackOptions(true),
      path.resolve(__dirname, 'fixtures/expected/default-dist-with-html'),
      path.resolve(__dirname, 'fixtures/expected/default-cache')
    )
    .then(done)
    .catch(done);
  });

  it('works with cache hit, dist directory still populated', function (done) {
    var webpackOptions = createWebpackOptions();
    runWebpack(webpackOptions)
      .then(function () {
        test(
            'works with cache hit, dist directory still populated',
            webpackOptions,
            path.resolve(__dirname, 'fixtures/expected/default-dist'),
            path.resolve(__dirname, 'fixtures/expected/default-cache')
            )
          .then(done)
          .catch(done);
      });
  });

  it('works with cache hit, dist directory cleared', function (done) {
    var webpackOptions = createWebpackOptions();
    runWebpack(webpackOptions)
      .then(function () {
        return deleteDir(OUTPUT_DIR);
      })
      .then(function () {
        return test(
            'works with cache hit, dist directory cleared',
            webpackOptions,
            path.resolve(__dirname, 'fixtures/expected/default-dist'),
            path.resolve(__dirname, 'fixtures/expected/default-cache')
        )
        .then(done)
        .catch(done);
      });
  });
});

// additional tests:
// missing logo file
// [hash] in prefix and stats file
// different logo option ouputs - adds/removes

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
var copyDir = makePromise(require('ncp'));
var readDirFiles = require('node-dir').readFiles;

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
  compareContents: true,
  excludeFilter: '.compilationResult,*.json'
};

var READ_JSON_FILES_OPTIONS = {
  match: /(\.json)$/,
  recursive: false
};

var COMPARISON_STATES = {
  'equal': '==',
  'left': '->',
  'right': '<-',
  'distinct': '<>'
};

var CHECK_STATS_FILE = true;

// extend jasmine timeouts for slow processing
var timeout = (typeof v8debug === 'object') ? 600000 : 5000;
jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;

function test (description, webpackConfig, expectedDist, expectedCache, checkStatsFile) {
  var recordDuration = startTiming(description);
  return runWebpack(webpackConfig)
    .then(recordDuration)
    .then(checkForCompilationErrors)
    .then(function () {
      return Promise.all([
        makeDirComparePromise(expectedDist, OUTPUT_DIR),
        expectedCache
          ? makeDirComparePromise(expectedCache, CACHE_DIR)
          : makeCheckNoDirPromise(CACHE_DIR),
        checkStatsFile
          ? makeStatsFileComparePromise(expectedDist, OUTPUT_DIR)
          : Promise.resolve()
      ]);
    })
    .catch(function (err) {
      fail(err);
      throw err;
    });
}

function startTiming (description, start) {
  start = start || Date.now();
  return function (webpackStats) {
    var duration = Date.now() - start;
    var msg = 'RUN COMPLETE : ' + description + ' : ' + duration + 'ms';
    console.log(msg);
    return Promise.resolve(webpackStats);
  };
}

function checkForCompilationErrors (webpackStats) {
  var compilationErrors = (webpackStats.compilation.errors || []).join('\n');
  expect(compilationErrors).toBe('');
  var compilationWarnings = (webpackStats.compilation.warnings || []).join('\n');
  expect(compilationWarnings).toBe('');
  if (compilationErrors === '' && compilationWarnings === '') {
    return Promise.resolve();
  } else {
    return Promise.reject('compilation errors');
  }
}

function makeDirComparePromise (expected, actual) {
  return dirCompare.compare(expected, actual, COMPARE_OPTIONS).then(function (compareResult) {
    if (!compareResult.same) {
      fail(detailDirectoryDifferences(expected, actual, compareResult));
    }
  });
}

function makeCheckNoDirPromise (shouldNotExistDir) {
  return new Promise(function (resolve, reject) {
    fs.access(shouldNotExistDir, fs.F_OK, function (err) {
      if (err) {
        resolve();
      } else {
        shouldNotExistDir = shouldNotExistDir.slice(ROOT_DIR.length);
        fail('Expected directory "' + shouldNotExistDir + '" not to exist');
        reject();
      }
    });
  });
}

function makeStatsFileComparePromise (expectedDir, actualDir) {
  var jsonContent = [];

  var read = function (dir, contentArray, callback) {
    readDirFiles(
      dir,
      READ_JSON_FILES_OPTIONS,
      function (err, content, next) {
        if (err) {
          callback(err);
        } else {
          jsonContent.push(content);
          next();
        }
      },
      callback);
  };

  var isContentSame = function (expected, actual) {
    // ignore different order of files
    expected = expected.split('"').sort().join();
    actual = actual.split('"').sort().join();
    return expected === actual;
  };

  return new Promise(function (resolve, reject) {
    read(expectedDir, jsonContent, function (err) {
      if (err) return reject(err);
      var msg;
      read(actualDir, jsonContent, function (err) {
        if (err) {
          reject(err);
        } else if (jsonContent.length !== 2) {
          msg = 'Missing or unexpected json files';
          fail(msg);
          reject(msg);
        } else if (!isContentSame(jsonContent[0], jsonContent[1])) {
          msg = 'Expected stats file contents do not equal actual stats file';
          fail(msg);
          reject(msg);
        } else {
          resolve();
        }
      });
    });
  });
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

function deleteDirs (dirs) {
  return Promise.all(dirs.map(function (dir) {
    return deleteDir(dir);
  }));
}

function copyDirs (toDirs, fromDirs) {
  return Promise.all(toDirs.map(function (to, index) {
    return copyDir(to, fromDirs[index]);
  }));
}

function endErr (done) {
  return function (err) { fail(err); done(); };
}

/*
 * TESTS START HERE
 */
describe('FaviconWebpackPlugin', function () {
  beforeEach(function (done) {
    deleteDirs([OUTPUT_DIR, CACHE_DIR])
      .then(done)
      .catch(done);
  });

  it('no caching', function (done) {
    test(
      'no caching',
      createWebpackOptions(false, {persistentCache: false}),
      path.resolve(__dirname, 'fixtures/expected/dist'),
      null
    )
    .then(done)
    .catch(endErr(done));
  });

  it('no caching, with stats', function (done) {
    test(
      'no caching, with stats',
      createWebpackOptions(false, {
        persistentCache: false,
        emitStats: true,
        statsFilename: 'stats-[hash].json'
      }),
      path.resolve(__dirname, 'fixtures/expected/dist-with-stats'),
      null,
      CHECK_STATS_FILE
    )
    .then(done)
    .catch(endErr(done));
  });

  it('no caching, with html', function (done) {
    test(
      'no caching, with html',
      createWebpackOptions(true, {persistentCache: false}),
      path.resolve(__dirname, 'fixtures/expected/dist-with-html'),
      null
    )
    .then(done)
    .catch(endErr(done));
  });

  it('empty cache, cache miss', function (done) {
    test(
      'empty cache, cache miss',
      createWebpackOptions(),
      path.resolve(__dirname, 'fixtures/expected/dist'),
      path.resolve(__dirname, 'fixtures/expected/cache')
    )
    .then(done)
    .catch(endErr(done));
  });

  it('empty cache, cache miss, with stats', function (done) {
    test(
      'empty cache, cache miss, with stats',
      createWebpackOptions(false, {
        emitStats: true,
        statsFilename: 'stats.json'
      }),
      path.resolve(__dirname, 'fixtures/expected/dist-with-stats'),
      path.resolve(__dirname, 'fixtures/expected/cache-with-stats'),
      CHECK_STATS_FILE
    )
    .then(done)
    .catch(endErr(done));
  });

  it('empty cache, cache miss, with html', function (done) {
    test(
      'empty cache, cache miss, with html',
      createWebpackOptions(true),
      path.resolve(__dirname, 'fixtures/expected/dist-with-html'),
      path.resolve(__dirname, 'fixtures/expected/cache')
    )
    .then(done)
    .catch(endErr(done));
  });

  it('hot cache hit, dist directory populated', function (done) {
    var webpackOptions = createWebpackOptions();
    runWebpack(webpackOptions)
      .then(function () {
        return test(
          'hot cache hit, dist directory populated',
          webpackOptions,
          path.resolve(__dirname, 'fixtures/expected/dist'),
          path.resolve(__dirname, 'fixtures/expected/cache')
        );
      })
      .then(done)
      .catch(endErr(done));
  });

  it('cold cache hit, dist directory populated', function (done) {
    var distContents = path.resolve(__dirname, 'fixtures/expected/dist');
    var cacheContents = path.resolve(__dirname, 'fixtures/expected/cache');
    copyDirs([cacheContents, distContents], [CACHE_DIR, OUTPUT_DIR])
      .then(function () {
        return test(
          'cold cache hit, dist directory populated',
          createWebpackOptions(),
          distContents,
          cacheContents
        );
      })
      .then(done)
      .catch(endErr(done));
  });

  it('hot cache hit, dist directory empty', function (done) {
    var webpackOptions = createWebpackOptions();
    runWebpack(webpackOptions)
      .then(function () {
        return deleteDir(OUTPUT_DIR);
      })
      .then(function () {
        return test(
          'hot cache hit, dist directory empty',
          webpackOptions,
          path.resolve(__dirname, 'fixtures/expected/dist'),
          path.resolve(__dirname, 'fixtures/expected/cache')
        );
      })
      .then(done)
      .catch(endErr(done));
  });

  it('cold cache hit, dist directory empty', function (done) {
    var cacheContents = path.resolve(__dirname, 'fixtures/expected/cache');
    copyDir(cacheContents, CACHE_DIR)
      .then(function () {
        return test(
         'cold cache hit, dist directory empty',
          createWebpackOptions(),
          path.resolve(__dirname, 'fixtures/expected/dist'),
          cacheContents
        );
      })
      .then(done)
      .catch(endErr(done));
  });

  it('cache hit, dist directory empty, with stats', function (done) {
    var webpackOptions = createWebpackOptions(false, {
      emitStats: true,
      statsFilename: 'stats.json'
    });
    runWebpack(webpackOptions)
      .then(function () {
        return deleteDir(OUTPUT_DIR);
      })
      .then(function () {
        return test(
          'cache hit, dist directory empty, with stats',
          webpackOptions,
          path.resolve(__dirname, 'fixtures/expected/dist-with-stats'),
          path.resolve(__dirname, 'fixtures/expected/cache-with-stats'),
          CHECK_STATS_FILE
        );
      })
      .then(done)
      .catch(endErr(done));
  });

  it('cache hit, dist directory empty, with hash prefix', function (done) {
    var webpackOptions = createWebpackOptions(false, {
      prefix: 'icons-[hash]/'
    });
    runWebpack(webpackOptions)
      .then(function () {
        return deleteDir(OUTPUT_DIR);
      })
      .then(function () {
        return test(
          'cache hit, dist directory empty, with hash prefix',
          webpackOptions,
          path.resolve(__dirname, 'fixtures/expected/dist-with-hash-prefix'),
          path.resolve(__dirname, 'fixtures/expected/cache-with-hash-prefix')
        );
      })
      .then(done)
      .catch(endErr(done));
  });

  it('cache hit, dist directory empty, with hash stats file', function (done) {
    var webpackOptions = createWebpackOptions(false, {
      prefix: 'icons/',
      emitStats: true,
      statsFilename: 'iconstats-[hash].json'
    });
    runWebpack(webpackOptions)
      .then(function () {
        return deleteDir(OUTPUT_DIR);
      })
      .then(function () {
        return test(
          'cache hit, dist directory empty, with hash stats file',
          webpackOptions,
          path.resolve(__dirname, 'fixtures/expected/dist-with-hash-stats'),
          path.resolve(__dirname, 'fixtures/expected/cache-with-hash-stats'),
          CHECK_STATS_FILE
        );
      })
      .then(done)
      .catch(endErr(done));
  });
});

// additional tests:
// missing logo file
// different logo option ouputs - adds/removes

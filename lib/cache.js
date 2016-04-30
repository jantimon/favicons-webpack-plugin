'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var loaderUtils = require('loader-utils');
var makePromise = require('denodeify');
var checkDir = makePromise(fs.access);
var writeToFile = makePromise(fs.writeFile);
var makeDir = makePromise(require('mkdirp'));
var copyFiles = makePromise(require('ncp'));

var CONSTANTS = {
  HASH_TYPE: 'md5',
  DIGEST_TYPE: 'hex',
  HASH_SIZE: 32,
  CACHE_DIR: '.cache',
  COMPILATION_RESULT_CACHE_FILE: '.compilationResult',
  COPY_TO_CACHE_OPTIONS: {
    clobber: false,
    stopOnErr: true
  },
  COPY_FROM_CACHE_OPTIONS: {
    clobber: false,
    stopOnErr: true,
    filter: /\.compilationResult/
  }
};

/**
 * Constructor creates instance of cache for passed options.
 */
function FaviconsCache (options, baseDir) {
  this.dirs = {
    base: baseDir,
    cache: path.resolve(baseDir, CONSTANTS.CACHE_DIR)
  };
  this.options = options;
}

/*
 * API method - report cache hit/miss based on constructor params
 */
FaviconsCache.prototype.fetch = function () {
  var self = this;

  var calculateHashValue = function () {
    return new Promise(function (resolve, reject) {
      try {
        var logoFile = path.resolve(self.dirs.base, self.options.logo);
        fs.stat(logoFile, function (err, stats) {
          if (err) {
            reject(err);
          } else {
            // strip out non pertinent data
            delete stats.atime;
            var hashContent = util.inspect(stats) + util.inspect(self.options);
            var hashValue = loaderUtils.getHashDigest(
                hashContent,
                CONSTANTS.HASH_TYPE,
                CONSTANTS.DIGEST_TYPE,
                CONSTANTS.HASH_SIZE);
            resolve(hashValue);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  var checkForHashDir = function (hashValue) {
    self.dirs.hash = path.resolve(self.dirs.cache, hashValue);
    return checkDir(self.dirs.hash, fs.R_OK);
  };

  var createCacheHit = function () {
    return new FaviconsCacheHit(self.dirs.hash);
  };

  var createCacheMiss = function () {
    return new FaviconsCacheMiss(self.dirs.hash, self.options);
  };

  return calculateHashValue()
    .then(checkForHashDir)
    .then(createCacheHit)
    .catch(createCacheMiss);
};

/**
 * The public contract for a cache hit
 */
function FaviconsCacheHit (cacheSubDir) {
  this.cacheSubDir = cacheSubDir;
}

/*
 * Public API - whether a cache hit or a miss
 */
FaviconsCacheHit.prototype.isMiss = function () {
  return false;
};

/*
 * Public API - return a Promise for the cached compilation result
 */
FaviconsCacheHit.prototype.getCachedCompilationResult = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    var cachedResult = path.resolve(self.cacheSubDir, CONSTANTS.COMPILATION_RESULT_CACHE_FILE);
    fs.readFile(cachedResult, function (err, data) {
      try {
        err ? reject(err) : resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
};

/**
 * Public API - copy the cached files to the build directory
 */
FaviconsCacheHit.prototype.postEmit = function (outputDir) {
  return copyFiles(this.cacheSubDir, outputDir, CONSTANTS.COPY_FROM_CACHE_OPTIONS);
};

/**
 * The public contract for a cache miss
 */
function FaviconsCacheMiss (cacheSubDir, options) {
  this.cacheSubDir = cacheSubDir;
  this.options = options;
}

/*
 * Public API - whether a cache hit or a miss
 */
FaviconsCacheMiss.prototype.isMiss = function () {
  return true;
};

/*
 * Public API - returns a promise of false
 */
FaviconsCacheMiss.prototype.getCachedCompilationResult = function () {
  return Promise.reject('cache miss');
};

/**
 * Public API - copy the the build directory directory files and the
 * compilation result to the cache
 */
FaviconsCacheMiss.prototype.postEmit = function (outputDir, compilationResult) {
  var self = this;
  return makeDir(self.cacheSubDir).then(function () {
    var tasks = [];
    // manage cache size
    tasks.push(manageCache());
    // copy icons directory
    var iconsDir = path.resolve(outputDir, self.options.prefix);
    tasks.push(copyFiles(iconsDir, self.cacheSubDir, CONSTANTS.COPY_TO_CACHE_OPTIONS));
    // copy stats file if there is one
    if (self.options.emitStats) {
      var statsFile = path.resolve(outputDir, self.options.statsFilename);
      var cachedStatsFile = path.resolve(self.cacheSubDir, self.options.statsFilename);
      tasks.push(copyFiles(statsFile, cachedStatsFile, CONSTANTS.COPY_TO_CACHE_OPTIONS));
    }
    // write compilation result
    var cachedCompilationResult = path.resolve(self.cacheSubDir, CONSTANTS.COMPILATION_RESULT_CACHE_FILE);
    tasks.push(writeToFile(cachedCompilationResult, JSON.stringify(compilationResult)));
    // await all
    return Promise.all(tasks);
  });
};

// manage the size of the cache
function manageCache () {
  // TODO - what do we do here?
  return Promise.resolve();
}

module.exports = FaviconsCache;

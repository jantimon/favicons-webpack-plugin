'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var loaderUtils = require('loader-utils');
var makePromise = require('denodeify');
var checkDir = makePromise(fs.access);
var writeToFile = makePromise(fs.writeFile);
var copyDir = makePromise(require('ncp'));

var CONSTANTS = {
  HASH_TYPE: 'md5',
  DIGEST_TYPE: 'hex',
  HASH_SIZE: 32,
  CACHE_DIR: '/cache',
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
function FaviconsCache (options, baseDir, outputDir) {
  this.dirs = {
    base: baseDir,
    output: outputDir,
    cache: path.resolve(this.dirs.base, CONSTANTS.CACHE_DIR)
  };
  this.options = options;
}

/*
 * API method - fetch cached files based on constructor arguments
 */
FaviconsCache.prototype.fetch = function () {
  return this._calculateHashValue()
    .then(this._checkHashDir)
    .then(this._createCacheHit)
    .catch(this._createCacheMiss);
};

// generates the name of the subdirectory within the cache directory
// for the current options and the metadata of the icon file
FaviconsCache.prototype._calculateHashValue = function () {
  return new Promise(function (resolve, reject) {
    var iconFile = path.resolve(this.dirs.base, this.options.icon);
    fs.stat(iconFile, function (err, stats) {
      if (err) {
        reject(err);
      } else {
        var hashContent = util.inspect(stats) + util.inspect(this.options);
        var hashValue = loaderUtils.getHashDigest(
            hashContent,
            CONSTANTS.HASH_TYPE,
            CONSTANTS.DIGEST_TYPE,
            CONSTANTS.HASH_SIZE);
        return hashValue;
      }
    });
  });
};

FaviconsCache.prototype._checkHashDir = function (hashValue) {
  this.dirs.hash = path.resolve(this.dirs.cache, hashValue);
  return checkDir(this.dirs.hash, fs.R_OK);
};

FaviconsCache.prototype._createCacheHit = function () {
  return new FaviconsCacheHit(
      this.dirs.hash,
      this.dirs.output);
};

FaviconsCache.prototype._createCacheMiss = function (err) {
  if (err) {
    // TODO - what to do here?
    console.log('Cache miss due to an error: ' + err);
  }
  return new FaviconsCacheMiss(
      path.resolve(this.dirs.output, this.options.prefix),
      path.resolve(this.dirs.hash, this.options.prefix));
};

/**
 * The public contract for a cache hit
 */
function FaviconsCacheHit (source, destination) {
  this.source = source;
  this.destination = destination;
}

/*
 * Public API - return a Promise for the cached compilation result
 */
FaviconsCacheHit.prototype.getCachedCompilationResult = function () {
  return new Promise(function (resolve, reject) {
    var cachedResult = path.resolve(this.source, CONSTANTS.COMPILATION_RESULT_CACHE_FILE);
    fs.readFile(cachedResult, function (err, data) {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
};

/**
 * Public API - copy the cached files to the build directory
 */
FaviconsCacheHit.prototype.postEmit = function () {
  return copyDir(this.source, this.destination, CONSTANTS.COPY_FROM_CACHE_OPTIONS);
};

/**
 * The public contract for a cache miss
 */
function FaviconsCacheMiss (source, destination) {
  this.source = source;
  this.destination = destination;
}

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
FaviconsCacheMiss.prototype.postEmit = function (compilationResult) {
  var cacheFile = path.resolve(this.destination, CONSTANTS.COMPILATION_RESULT_CACHE_FILE);
  return Promise.all([
    manageCache(),
    copyDir(this.source, this.destination, CONSTANTS.COPY_TO_CACHE_OPTIONS),
    writeToFile(cacheFile, JSON.stringify(compilationResult))
  ]);
};

// manage the size of the cache
function manageCache () {
  // TODO - what do we do here?
  return Promise.resolve(true);
}

module.exports = FaviconsCache;

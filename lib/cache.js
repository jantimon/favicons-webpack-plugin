'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var loaderUtils = require('loader-utils');
var makePromise = require('denodeify');
var checkDir = makePromise(fs.access);
var makeDir = makePromise(fs.mkdir);
var writeToFile = makePromise(fs.writeFile);
var copyDir = makePromise(require('ncp'));

var CONSTANTS = {
  HASH_TYPE: 'md5',
  DIGEST_TYPE: 'hex',
  HASH_SIZE: 32,
  CACHE_DIR: '/cache',
  COMPILATION_RESULT: '.compilationResult',
  PUT_OPTIONS: {
    clobber: false,
    stopOnErr: true
  },
  EMIT_OPTIONS: {
    clobber: false,
    stopOnErr: true,
    filter: /\.compilationResult/
  }
};

/**
 * Constructor creates instance of cache for passed options.
 */
function FaviconsCache (baseDir, outputDir, options) {
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
    .then(this._createCacheHit, this._createCacheMiss);
};

/**
 * API method: put passed compilationResult and associated files into cache
 */
FaviconsCache.prototype.put = function (compilationResult) {
  this.dirs.put_source = path.resolve(this.dirs.output, this.options.prefix);
  this.dirs.put_destination = path.resolve(this.dirs.hash, this.options.prefix);
  return makeDir(this.dirs.put_destination)
    .then(this._copyToCache)
    .then(function () {
      var cachedResult = path.resolve(this.dirs.put_destination, CONSTANTS.COMPILATION_RESULT);
      return writeToFile(cachedResult, JSON.stringify(compilationResult));
    });
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
  return new FaviconsCacheHit(this.dirs.hash, this.dirs.output);
};

FaviconsCache.prototype._createCacheMiss = function (err) {
  if (err) console.log('Cache miss due to error: ' + err);
  return false;
};

FaviconsCache.prototype._copyToCache = function () {
  return copyDir(this.dirs.put_source, this.dirs.put_destination, CONSTANTS.PUT_OPTIONS);
};

/**
 * The public contract for a cache hit
 */
function FaviconsCacheHit (source, destination) {
  this.source = source;
  this.destination = destination;
}

/*
 * Public API - fetch the cached compilation result
 */
FaviconsCacheHit.prototype.getCompilationResult = function () {
  return new Promise(function (resolve, reject) {
    var cachedResult = path.resolve(this.source, CONSTANTS.COMPILATION_RESULT);
    fs.readFile(cachedResult, function (err, data) {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
};

/**
 * Public API - copy the cached files to the build directory
 */
FaviconsCacheHit.prototype.emit = function () {
  return copyDir(this.source, this.destination, CONSTANTS.EMIT_OPTIONS);
};

module.exports = FaviconsCache;

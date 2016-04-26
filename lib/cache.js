'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var loaderUtils = require('loader-utils');
var ncp = require('ncp');

var CONSTANTS = {
  HASH_TYPE: 'md5',
  DIGEST_TYPE: 'hex',
  HASH_SIZE: 32,
  CACHE_DIR: '/cache',
  COMPILATION_RESULT: '.compilationResult',
  EMIT_FILTER: {filter: /\.compilationResult/}
};

function FaviconsCache (baseDir, outputDir, options) {
  this.dirs = {
    base: baseDir,
    output: outputDir,
    cache: path.resolve(this.dirs.base, CONSTANTS.CACHE_DIR)
  };
  this.options = options;
}

// generates the name of the subdirectory within the cache directory
// for the current options and the metadata of the icon file
FaviconsCache.prototype.calculateHashDir = function (callback) {
  var iconFile = path.resolve(this.dirs.base, this.options.icon);
  fs.stat(iconFile, function (err, stats) {
    if (err) callback(err);
    var hashContent = util.inspect(stats) + util.inspect(this.options);
    var hashValue = loaderUtils.getHashDigest(
        hashContent,
        CONSTANTS.HASH_TYPE,
        CONSTANTS.DIGEST_TYPE,
        CONSTANTS.HASH_SIZE);
    this.dirs.hash = path.resolve(this.dirs.cache, hashValue);
    callback();
  });
};

FaviconsCache.prototype.fetch = function (callback) {
  this.calculateHashDir(function (err) {
    if (err) callback(err);
    fs.access(this.dirs.hash, fs.R_OK, function (err) {
      if (err) {
        callback(null, false);
      } else {
        var cacheHit = new FaviconsCacheHit(this.dirs.hash, this.dirs.output);
        callback(null, cacheHit);
      }
    });
  });
};

FaviconsCache.prototype.put = function (compilationResult, callback) {
  var source = path.resolve(this.dirs.output, this.options.prefix);
  var destination = path.resolve(this.dirs.hash, this.options.prefix);
  ncp(source, destination, function (err) {
    if (err) callback(err);
    var cachedResult = path.resolve(destination, CONSTANTS.COMPILATION_RESULT);
    fs.write(cachedResult, JSON.stringify(compilationResult), callback);
  });
};

function FaviconsCacheHit (source, destination) {
  this.source = source;
  this.destination = destination;
}

FaviconsCacheHit.prototype.getCompilationResult = function (callback) {
  var cachedResult = path.resolve(this.source, CONSTANTS.COMPILATION_RESULT);
  fs.readFile(cachedResult, function (err, data) {
    if (err) callback(err);
    callback(null, JSON.parse(data));
  });
};

FaviconsCacheHit.prototype.emit = function (callback) {
  ncp(this.source, this.destination, CONSTANTS.EMIT_FILTER, callback);
};

module.exports = FaviconsCache;

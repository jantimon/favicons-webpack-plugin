'use strict';

function FaviconsNullCache (options, baseDir) {
  this.fetchResult = Promise.reject('cache miss');
}

FaviconsNullCache.prototype.fetch = function () {
  return this.fetchResult;
};

module.exports = FaviconsNullCache;


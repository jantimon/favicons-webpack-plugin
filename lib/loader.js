'use strict';
var loaderUtils = require('loader-utils');
var favicons = require('favicons/es5');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

module.exports = function (content) {
  var self = this;
  self.cacheable && this.cacheable();
  if (!self.emitFile) throw new Error('emitFile is required from module system');
  if (!self.async) throw new Error('async is required');

  var callback = self.async();
  var query = loaderUtils.parseQuery(self.query);
  var pathPrefix = loaderUtils.interpolateName(self, query.outputFilePrefix, {
    context: query.context || this.options.context,
    content: content,
    regExp: query.regExp
  });
  var fileHash = loaderUtils.interpolateName(self, '[hash]', {
    context: query.context || this.options.context,
    content: content,
    regExp: query.regExp
  });
  var cacheFile = pathPrefix + '.cache';
  loadIconsFromDiskCache(self, query, cacheFile, fileHash, function (err, cachedResult) {
    if (err) return callback(err);
    if (cachedResult) {
      return callback(null, '// LOADER START //' + cachedResult + '// LOADER END //');
    }
    // Generate icons
    generateIcons(self, content, pathPrefix, query, function (err, iconResult) {
      if (err) return callback(err);
      emitCacheFile(self, query, cacheFile, fileHash, iconResult);
      callback(null, '// LOADER START //' + iconResult + '// LOADER END //');
    });
  });
};

function hashOptions (options) {
  var hash = crypto.createHash('md5');
  hash.update(JSON.stringify(options));
  return hash.digest('hex');
}

function getPublicPath (compilation) {
  var publicPath = compilation.outputOptions.publicPath || '';
  if (publicPath.length && publicPath.substr(-1) !== '/') {
    publicPath += '/';
  }
  return publicPath;
}

function emitCacheFile (loader, query, cacheFile, fileHash, iconResult) {
  if (!query.persistentCache) {
    return;
  }
  loader.emitFile(cacheFile, JSON.stringify({
    hash: fileHash,
    optionHash: hashOptions(query),
    result: iconResult
  }));
}

/**
 * Try to load the file from the disc cache
 */
function loadIconsFromDiskCache (loader, query, cacheFile, fileHash, callback) {
  // Stop if cache is disabled
  if (!query.persistentCache) return callback(null);
  var resolvedCacheFile = path.resolve(__dirname, loader._compiler.parentCompilation.compiler.outputPath, cacheFile);

  fs.exists(resolvedCacheFile, function (exists) {
    if (!exists) return callback(null);
    fs.readFile(resolvedCacheFile, function (err, content) {
      if (err) return callback(err);
      try {
        var cache = JSON.parse(content);
        // Bail out if the file or the option changed
        if (cache.hash !== fileHash || cache.optionHash !== hashOptions(query)) {
          return callback(null);
        }
        callback(null, cache.result);
      } catch (e) {
        callback(e);
      }
    });
  });
}

function generateIcons (loader, imageFileStream, pathPrefix, query, callback) {
  var publicPath = getPublicPath(loader._compilation);
  favicons(imageFileStream, {
    path: '',
    url: '',
    icons: query.icons,
    background: query.background,
    appName: query.appName
  }, function (err, result) {
    if (err) return callback(err);
    var html = result.html.filter(function (entry) {
      return entry.indexOf('manifest') === -1;
    })
    .map(function (entry) {
      return entry.replace(/(href=[""])/g, '$1' + publicPath + pathPrefix);
    });
    var loaderResult = {
      outputFilePrefix: pathPrefix,
      html: html,
      files: []
    };
    result.images.forEach(function (image) {
      loaderResult.files.push(pathPrefix + image.name);
      loader.emitFile(pathPrefix + image.name, image.contents);
    });
    result.files.forEach(function (file) {
      loaderResult.files.push(pathPrefix + file.name);
      loader.emitFile(pathPrefix + file.name, file.contents);
    });
    callback(null, JSON.stringify(loaderResult));
  });
}

module.exports.raw = true;

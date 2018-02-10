'use strict';
var loaderUtils = require('loader-utils');
var favicons = require('favicons/es5');

module.exports = function (content) {
  var self = this;
  if (!self.emitFile) throw new Error('emitFile is required from module system');
  if (!self.async) throw new Error('async is required');

  var callback = self.async();
  var query = loaderUtils.parseQuery(self.query);
  var pathPrefix = loaderUtils.interpolateName(self, query.outputFilePrefix, {
    context: query.context || this.rootContext || this.options.context,
    content: content,
    regExp: query.regExp
  });
  var fileHash = loaderUtils.interpolateName(self, '[hash]', {
    context: query.context || this.rootContext || this.options.context,
    content: content,
    regExp: query.regExp
  });

  // Generate icons
  generateIcons(self, content, pathPrefix, query, function (err, iconResult) {
    if (err) return callback(err);
    callback(null, 'module.exports = ' + JSON.stringify(iconResult));
  });
};

function getPublicPath (compilation) {
  var publicPath = compilation.outputOptions.publicPath || '';
  if (publicPath.length && publicPath.substr(-1) !== '/') {
    publicPath += '/';
  }
  return publicPath;
}

function generateIcons (loader, imageFileStream, pathPrefix, query, callback) {
  var publicPath = getPublicPath(loader._compilation);
  var faviconsOptions = query.faviconsOptions;
  faviconsOptions.url = faviconsOptions.url || '';
  faviconsOptions.path = faviconsOptions.path || '';
  favicons(imageFileStream, query.faviconsOptions, function (err, result) {
    if (err) return callback(err);
    result.images.forEach(function (image) {
      loader.emitFile(pathPrefix + image.name, image.contents);
    });
    result.files.forEach(function (file) {
      loader.emitFile(pathPrefix + file.name, file.contents);
    });
    callback(null, result.html.map(function (entry) {
      return entry.replace(/(href=[""])/g, '$1' + publicPath + pathPrefix);
    }));
  });
}

module.exports.raw = true;

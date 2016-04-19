'use strict';
var loaderUtils = require('loader-utils');
var favicons = require('favicons/es5');

module.exports = function (content) {
  var self = this;
  self.cacheable && this.cacheable();
  if (!self.emitFile) throw new Error('emitFile is required from module system');
  if (!self.async) throw new Error('async is required');
  var callback = self.async();
  var query = loaderUtils.parseQuery(self.query);
  var prefix = loaderUtils.interpolateName(self, query.outputFilePrefix, {
    context: query.context || this.options.context,
    content: content,
    regExp: query.regExp
  });
  var publicPath = self._compilation.outputOptions.publicPath || '';
  if (publicPath.length && publicPath.substr(-1) !== '/') {
    publicPath += '/';
  }
  favicons(content, {
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
      return entry.replace(/(href=[""])/g, '$1' + publicPath + prefix);
    });
    var loaderResult = {
      outputFilePrefix: prefix,
      html: html,
      files: []
    };
    result.images.forEach(function (image) {
      loaderResult.files.push(prefix + image.name);
      self.emitFile(prefix + image.name, image.contents);
    });
    result.files.forEach(function (file) {
      loaderResult.files.push(prefix + file.name);
      self.emitFile(prefix + file.name, file.contents);
    });
    callback(null, '// LOADER START //' + JSON.stringify(loaderResult) + '// LOADER END //');
  });
};

module.exports.raw = true;

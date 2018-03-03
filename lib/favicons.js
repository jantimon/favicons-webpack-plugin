'use strict';
const loaderUtils = require('loader-utils');
const favicons = require('favicons');

module.exports = function (content) {
  if (!this.emitFile) throw new Error('emitFile is required from module system');
  if (!this.async) throw new Error('async is required');

  const callback = this.async();
  const query = loaderUtils.parseQuery(this.query);
  const params = {
    context: query.context || (this.options && this.options.context) || this.rootContext,
    regExp: query.regExp,
    content
  };
  const pathPrefix = loaderUtils.interpolateName(this, query.outputFilePrefix, params);
  const fileHash = loaderUtils.interpolateName(this, '[hash]', params);

  // Generate icons
  generateIcons(this, content, pathPrefix, query, (err, iconResult) => !err
    ? callback(null, 'module.exports = ' + JSON.stringify(iconResult))
    : callback(err)
  );
};

function getPublicPath (compilation) {
  let publicPath = compilation.outputOptions.publicPath || '';
  if (publicPath.length && publicPath.substr(-1) !== '/') {
    publicPath += '/';
  }
  return publicPath;
}

function generateIcons (loader, imageFileStream, pathPrefix, query, callback) {
  const publicPath = getPublicPath(loader._compilation);
  const faviconsOptions = query.faviconsOptions;
  faviconsOptions.url = faviconsOptions.url || '';
  faviconsOptions.path = faviconsOptions.path || '';
  favicons(imageFileStream, query.faviconsOptions, (err, result) => {
    if (err) return callback(err);
    result.images.forEach((image) => loader.emitFile(pathPrefix + image.name, image.contents));
    result.files.forEach((file) => loader.emitFile(pathPrefix + file.name, file.contents));
    callback(null, result.html.map((entry) => entry.replace(/(href=[""])/g, '$1' + publicPath + pathPrefix)));
  });
}

module.exports.raw = true;

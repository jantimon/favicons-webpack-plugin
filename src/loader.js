const favicons = require('favicons');
const {parseQuery, interpolateName} = require('loader-utils');
const {getPublicPath} = require('./compat');

module.exports = function (content) {
  if (!this.emitFile) throw new Error('emitFile is required');
  if (!this.async) throw new Error('async is required');

  const {
    regExp, prefix, options,
    context = (this.options && this.options.context) || this.rootContext,
  } = parseQuery(this.query);

  const callback = this.async();
  const publicPath = getPublicPath(this._compilation);
  const path = interpolateName(this, prefix, {context, regExp, content});

  // Generate icons
  favicons(content, Object.assign({url: '', path: ''}, options), (err, {images = [], files = [], html = []} = {}) => {
    if (err) {
      return callback(err);
    }

    [...images, ...files].forEach(({name, contents}) => this.emitFile(path + name, contents));

    const result = html.map((entry) => entry.replace(/(href=['"])/g, '$1' + publicPath + path));
    return callback(null, 'module.exports = ' + JSON.stringify(result.sort().join('')));
  });
};

module.exports.raw = true;

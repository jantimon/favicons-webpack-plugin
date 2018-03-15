const favicons = require('favicons');
const msgpack = require('msgpack-lite');
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
  favicons(content, options, (err, {images = [], files = [], html = []} = {}) => {
    if (err) {
      return callback(err);
    }

    const assets = [...images, ...files].map(({name, contents}) => ({name: path + name, contents}));
    html = html.map((entry) => entry.replace(/(href=['"])/g, '$1' + publicPath + path)).sort().join('');

    return callback(null, 'module.exports = ' + JSON.stringify(msgpack.encode({html, assets}).toString('base64')));
  });
};

module.exports.raw = true;

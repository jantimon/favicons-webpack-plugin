const url = require('url');
const favicons = require('favicons');
const msgpack = require('msgpack-lite');
const {parseQuery, interpolateName} = require('loader-utils');
const {getContext} = require('./compat');

const trailingSlash = (path) => (path.substr(-1) !== '/') ? path + '/' : path;
const getPublicPath = ({outputOptions: {publicPath = '/'}}) => publicPath && trailingSlash(publicPath);

module.exports = function (content) {
  /* istanbul ignore next */
  if (!this.async) throw new Error('async is required');

  const {prefix, options} = parseQuery(this.query);

  const callback = this.async();
  const context = getContext(this);
  const publicPath = getPublicPath(this._compilation);
  const path = prefix && trailingSlash(interpolateName(this, prefix, {
    context,
    content: msgpack.encode([content, options]), // hash must depend on logo + config
  }));

  // Generate icons
  return favicons(content, Object.assign(options, {path: url.resolve(publicPath, path)}))
    .then(result => {
      const html = result.html.join('');
      const assets = [...result.images, ...result.files].map(({name, contents}) => ({name: path + name, contents}));

      return callback(null, 'module.exports = ' + JSON.stringify(msgpack.encode({html, assets}).toString('base64')));
    })
    .catch(callback);
};

module.exports.raw = true;

const url = require('url');
const favicons = require('favicons');
const msgpack = require('msgpack-lite');
const {parseQuery, interpolateName} = require('loader-utils');
const {getContext} = require('./compat');

const trailingSlash = (path) => (path.substr(-1) !== '/') ? path + '/' : path;

module.exports = function (content) {
  /* istanbul ignore next */
  if (!this.async) throw new Error('async is required');

  const callback = this.async();
  const query = parseQuery(this.query);
  const path = query.path && trailingSlash(query.path);
  const prefix = query.prefix && trailingSlash(interpolateName(this, query.prefix, {
    context: getContext(this),
    content: msgpack.encode([content, query.options]), // hash must depend on logo + config
  }));

  // Generate icons
  return favicons(content, Object.assign(query.options, {path: url.resolve(path, prefix)}))
    .then(result => {
      const html = result.html.join('');
      const assets = [...result.images, ...result.files].map(({name, contents}) => ({name: prefix + name, contents}));

      return callback(null, 'module.exports = ' + JSON.stringify(msgpack.encode({html, assets}).toString('base64')));
    })
    .catch(callback);
};

module.exports.raw = true;

const url = require('url');
const favicons = require('favicons');
const msgpack = require('msgpack-lite');
const { parseQuery, interpolateName } = require('loader-utils');
const { getContext } = require('./compat');
const pkg = require('../package.json')

const trailingSlash = (path) => (path.substr(-1) !== '/') ? path + '/' : path;

module.exports = function (content) {
  /* istanbul ignore next */
  if (!this.async) throw new Error('async is required');

  const callback = this.async();
  const query = parseQuery(this.query);
  const path = query.path && trailingSlash(query.path);
  const prefix = query.prefix && trailingSlash(interpolateName(this, query.prefix, {
    context: getContext(this),
    content: msgpack.encode([content, query.options, pkg.version]), // hash must depend on logo + config + version
  }));

  // Generate icons
  return favicons(content, Object.assign(query.options, { path: url.resolve(path, prefix) }))
    .then(({ html: tags, images, files }) => {
      const assets = [...images, ...files].map(({ name, contents }) => ({ name: prefix + name, contents }));
      return callback(null, `module.exports = '${msgpack.encode({ tags, assets }).toString('base64')}'`);
    })
    .catch(callback);
};

module.exports.raw = true;

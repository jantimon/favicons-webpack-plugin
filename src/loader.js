const url = require('url');
const favicons = require('favicons');
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
    content: JSON.stringify([content, query.options, pkg.version]), // hash must depend on logo + config + version
  }));
  const outputPath = query.outputPath ? trailingSlash(query.outputPath) : prefix;
  // Generate icons
  return favicons(content, Object.assign(query.options, { path: url.resolve(path, prefix) }))
    .then(({ html: tags, images, files }) => {
      const assets = [...images, ...files].map(({ name, contents }) => ({ name: outputPath + name, contents: toBase64(contents) }));
      // The loader result will be cached by the cache loader and sent to the compiler
      const loaderResult = JSON.stringify({ tags, assets });
      return callback(null,  'module.exports=' + loaderResult);
    })
    .catch(callback);
};

function toBase64(content) {
  return Buffer.from(content).toString('base64')
}

module.exports.raw = true;
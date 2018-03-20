const favicons = require('favicons');
const msgpack = require('msgpack-lite');
const {parseQuery, interpolateName} = require('loader-utils');
const {getPublicPath, getContext} = require('./compat');

module.exports = function (content) {
  /* istanbul ignore next */
  if (!this.async) throw new Error('async is required');

  const {prefix, options} = parseQuery(this.query);

  const callback = this.async();
  const context = getContext(this);
  const publicPath = getPublicPath(this._compilation);
  const path = prefix && interpolateName(this, prefix, {context, content});

  // Generate icons
  favicons(content, options, (err, result) => {
    if (err) {
      return callback(new Error(err));
    }

    const refs = /(href=|content=|src=)(['"])([\w-]+[.](png|json|ico|xml))\2/g;
    const html = result.html.map((entry) => entry.replace(refs, '$1$2' + publicPath + path + '$3$2')).sort().join('');
    const images = result.images.map(({name, contents}) => ({name: path + name, contents}));
    const files = result.files.map(({name, contents}) => ({
      name: path + name,
      contents: contents.replace(refs, '$1$2' + publicPath + path + '$3$2'),
    }));

    const assets = [...images, ...files];

    return callback(null, 'module.exports = ' + JSON.stringify(msgpack.encode({html, assets}).toString('base64')));
  });
};

module.exports.raw = true;

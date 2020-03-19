const url = require('url');
const nodePath = require('path');
const favicons = require('favicons');
const { parseQuery, interpolateName } = require('loader-utils');
const pkg = require('../package.json');

const trailingSlash = (path) => (path.substr(-1) !== '/') ? path + '/' : path;

module.exports = async function (content) {
  const query = parseQuery(this.query);
  const path = query.path && trailingSlash(query.path);
  const prefix = query.prefix && trailingSlash(interpolateName(this, query.prefix, {
    context: this.rootContext,
    content: JSON.stringify([content, query.options, pkg.version]), // hash must depend on logo + config + version
  }));

  const outputPath = query.outputPath ? trailingSlash(query.outputPath) : prefix;

  // Generate icons
  const { html: tags, images, files } = await favicons(content, Object.assign(query.options, {
      path: url.resolve(path, prefix)
  }));

  /**
   * We can use the path+name combination as-is as long as the path is absolute.
   * If the path is relative, the relative url does not refer to the index.html file but instead
   * to the, on the same level located, manifest.json file. If the path is relative each icon-url needs to be
   * without further directory-prefix, otherwise "double-paths" like /assets/assets/my-image.png occur.
   *
   * Since the images are ALWAYS on the same level as the manifest.json we can safely only use the file-name
   * itself.
   */
  const isAbsolute = nodePath.isAbsolute(outputPath);
  const assets = [...images, ...files].map(({ name, contents }) => ({
      name: isAbsolute ? (outputPath + name) : name,
      contents: toBase64(contents)
  }));

  return `module.exports = ${JSON.stringify({ tags, assets })};`
};

function toBase64(content) {
  return Buffer.from(content).toString('base64')
}

module.exports.raw = true;
const url = require('url');
const favicons = require('favicons');
const { parseQuery, interpolateName } = require('loader-utils');
const pkg = require('../package.json');

const trailingSlash = path => (path.substr(-1) !== '/' ? `${path}/` : path);

module.exports = async function(content) {
  const query = parseQuery(this.query);
  const path = query.path && trailingSlash(query.path);
  const prefix =
    query.prefix &&
    trailingSlash(
      interpolateName(this, query.prefix, {
        context: this.rootContext,
        content: JSON.stringify([content, query.options, pkg.version]) // hash must depend on logo + config + version
      })
    );

  const outputPath = query.outputPath
    ? trailingSlash(query.outputPath)
    : prefix;

  // Generate icons
  const { html: tags, images, files } = await favicons(
    content,
    Object.assign(query.options, { path: url.resolve(path, prefix) })
  );
  const assets = [...images, ...files].map(({ name, contents }) => ({
    name: outputPath + name,
    contents: toBase64(contents)
  }));

  return `module.exports = ${JSON.stringify({ tags, assets })};`;
};

function toBase64(content) {
  return Buffer.from(content).toString('base64');
}

module.exports.raw = true;

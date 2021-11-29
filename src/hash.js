// @ts-check

// Import types
/** @typedef {import("webpack").Compilation} WebpackCompilation */

const crypto = require('crypto');
const url = require('url');

/**
 * Replaces [contenthash] and [fullhash] inside the given publicPath and assetPath
 *
 * @param {WebpackCompilation} compilation
 * @param {undefined | string | ((...args:any[]) => string)} publicPath
 * @param {string} assetPath
 */
function resolvePublicPath(compilation, publicPath, assetPath) {
  const publicPathString =
    publicPath && typeof publicPath === 'function'
      ? compilation.getAssetPath(publicPath, { hash: compilation.hash })
      : publicPath;

  const fullAssetPath = url.resolve(
    appendSlash(publicPathString || ''),
    assetPath
  );

  return fullAssetPath;
}

/**
 * Replaces [contenthash] and [fullhash] inside the given publicPath and assetPath
 *
 * @param {WebpackCompilation} compilation
 * @param {string} assetPath
 * @param {string} hash
 */
function replaceContentHash(compilation, assetPath, hash) {
  return compilation.getAssetPath(assetPath, {
    hash: compilation.hash || hash,
    chunk: {
      id: '1',
      hash
    },
    contentHash: hash
  });
}

/**
 * Adds a slash to a url
 * @param {string} url
 */
function appendSlash(url) {
  return url && url.length && url.substr(-1, 1) !== '/' ? `${url}/` : url;
}

/**
 * Returns the content hash for the given file content
 * @param {Buffer | string | undefined} file
 */
function getContentHash(file) {
  if (!file) {
    return '';
  }

  return crypto
    .createHash('sha256')
    .update(file.toString('utf8'))
    .digest('hex');
}

module.exports = { getContentHash, resolvePublicPath, replaceContentHash };

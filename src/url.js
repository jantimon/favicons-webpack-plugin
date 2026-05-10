const path = require('node:path');

/**
 * Resolve a relative URL/path against a base.
 *
 * @param {string | undefined} base
 * @param {string | undefined} relative
 * @returns {string}
 */
function resolveUrl(base, relative) {
  if (!base) {
    return relative ?? '';
  }
  if (!relative) {
    return base;
  }
  if (relative.startsWith('/')) {
    return relative;
  }
  const resolvedPath = path.posix.normalize(path.posix.join(base, relative));
  return resolvedPath === '.' ? '' : resolvedPath;
}

module.exports = { resolveUrl };

'use strict';
const fs = require('fs');
const parseAuthor = require('parse-author');
const camelCase = require('camelcase');

module.exports = {
  getAssetPath(template, name, args) {
    if (template.getAssetPath) /* Webpack >= 4.0 */ {
      return template.getAssetPath(name, args);
    } else {
      return template.applyPluginsWaterfall('asset-path', name, args);
    }
  },

  tap(tappable, hook, name, plugin) {
    return (
        (tappable.hooks) /* Webpack >= 4.0 */
      ? tappable.hooks[camelCase(hook)] && tappable.hooks[camelCase(hook)].tapAsync(name, plugin)
      : tappable.plugin(hook, plugin)
    );
  },

  /**
   * Reads json file if it exists
   */
  readJSON(file) {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : undefined;
  },

  /**
   * Normalize author to {name, email, url}
   */
  getAuthor(pkg) {
    return (
        typeof pkg.author === 'string'
      ? parseAuthor(pkg.author)
      : typeof pkg.author === 'object' && pkg.author
      ? {
          name: pkg.author.name,
          email: pkg.author.email,
          url: pkg.author.url,
        }
      : {}
    );
  },
};

'use strict';
const fs = require('fs');
const parseAuthor = require('parse-author');
const camelCase = require('camelcase');

function plug(tap, tappable, hook, name, plugin) {
  if (tappable.hooks) /* Webpack >= 4.0 */ {
    if (tappable.hooks[camelCase(hook)]) {
      return tappable.hooks[camelCase(hook)][tap](name, plugin);
    }
  } else {
    return tappable.plugin(hook, plugin);
  }
};

module.exports = {
  getAssetPath(template, name, args) {
    if (template.getAssetPath) /* Webpack >= 4.0 */ {
      return template.getAssetPath(name, args);
    } else {
      return template.applyPluginsWaterfall('asset-path', name, args);
    }
  },

  tap(tappable, hook, name, plugin) {
    return plug('tap', tappable, hook, name, plugin);
  },

  tapAsync(tappable, hook, name, plugin) {
    plug('tapAsync', tappable, hook, name, plugin);
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

'use strict';
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
};

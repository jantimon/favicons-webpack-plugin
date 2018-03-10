'use strict';
const path = require('path');
const assert = require('assert');
const child = require('./compiler');
const {tap, readJSON, getAuthor} = require('./util');

module.exports = class FaviconsWebpackPlugin {
  constructor(args) {
    const options = (typeof args === 'string') ? {logo: args} : args;
    assert(typeof options === 'object' && typeof options.logo === 'string', 'An input file is required');

    this.options = Object.assign({
      prefix: 'assets-[hash]/',
      favicons: {},
      inject: true,
    }, options);
  }

  apply(compiler) {
    const {
      appName = this.guessAppName(compiler.context),
      appDescription = this.guessDescription(compiler.context),
      version = this.guessVersion(compiler.context),
      developerName = this.guessDeveloperName(compiler.context),
      developerURL = this.guessDeveloperURL(compiler.context),
    } = this.options.favicons;

    Object.assign(this.options.favicons, {
      appName,
      appDescription,
      version,
      developerName,
      developerURL,
    });

    tap(compiler, 'make', 'FaviconsWebpackPlugin', async (compilation, callback) => {
      try {
        // Generate favicons
        const result = await child.run(this.options, compiler.context, compilation);
        if (this.options.inject) {
          // Hook into the html-webpack-plugin processing and add the html
          tap(compilation, 'html-webpack-plugin-before-html-processing', 'FaviconsWebpackPlugin', (htmlPluginData, callback) => {
            if (htmlPluginData.plugin.options.favicons !== false) {
              htmlPluginData.html = htmlPluginData.html.replace(/(<\/head>)/i, result.sort().join('') + '$&');
            }
            return callback(null, htmlPluginData);
          });
        }
        return callback();
      } catch (err) {
        return callback(err);
      }
    });
  }

  /**
   * Tries to find the package.json and caches its contents
   */
  findPackageJson(context) {
    return this.pkg = this.pkg // cache contents
      || readJSON(path.resolve(context, 'package.json'))
      || readJSON(path.resolve(context, '../package.json'))
      || {};
  }

  /**
   * Tries to guess the name from the package.json
   */
  guessAppName(context) {
    return this.findPackageJson(context).name;
  }

  /**
   * Tries to guess the description from the package.json
   */
  guessDescription(context) {
    return this.findPackageJson(context).description;
  }

  /**
   * Tries to guess the version from the package.json
   */
  guessVersion(context) {
    return this.findPackageJson(context).version;
  }

  /**
   * Tries to guess the author name from the package.json
   */
  guessDeveloperName(context) {
    return getAuthor(this.findPackageJson(context)).name;
  }

  /**
   * Tries to guess the author URL from the package.json
   */
  guessDeveloperURL(context) {
    return getAuthor(this.findPackageJson(context)).url;
  }
}

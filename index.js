'use strict';
const path = require('path');
const assert = require('assert');
const childCompiler = require('./lib/compiler.js');
const util = require('./lib/util.js');

function FaviconsWebpackPlugin (options) {
  if (typeof options === 'string') {
    options = {logo: options};
  }
  assert(typeof options === 'object', 'FaviconsWebpackPlugin options are required');
  assert(options.logo, 'An input file is required');
  this.options = options;
  this.options.prefix = this.options.prefix || 'assets-[hash]/';
  this.options.favicons = this.options.favicons || {};
  this.options.inject = (this.options.inject !== undefined) ? this.options.inject : true;
}

FaviconsWebpackPlugin.prototype.apply = function (compiler) {
  if (!this.options.favicons.appName) {
    this.options.favicons.appName = this.guessAppName(compiler.context);
  }

  if (!this.options.favicons.appDescription) {
    this.options.favicons.appDescription = this.guessDescription(compiler.context);
  }

  if (!this.options.favicons.version) {
    this.options.favicons.version = this.guessVersion(compiler.context);
  }

  if (!this.options.favicons.developerName) {
    this.options.favicons.developerName = this.guessDeveloperName(compiler.context);
  }

  if (!this.options.favicons.developerURL) {
    this.options.favicons.developerURL = this.guessDeveloperURL(compiler.context);
  }

  // Generate favicons
  let compilationResult;
  util.tapAsync(compiler, 'make', 'WebappWebpackPlugin', (compilation, callback) => {
    childCompiler.compileTemplate(this.options, compiler.context, compilation)
      .then((result) => {
        compilationResult = result;
        callback();
      })
      .catch(callback);
  });

  // Hook into the html-webpack-plugin processing
  // and add the html
  if (this.options.inject) {
    util.tap(compiler, 'compilation', 'HtmlWebpackPluginHooks', (compilation) => {
      util.tapAsync(compilation, 'html-webpack-plugin-before-html-processing', 'WebappWebpackPluginInjection', (htmlPluginData, callback) => {
        if (htmlPluginData.plugin.options.favicons !== false) {
          htmlPluginData.html = htmlPluginData.html.replace(/(<\/head>)/i, compilationResult.sort().join('') + '$&');
        }
        callback(null, htmlPluginData);
      });
    });
  }
};

/**
 * Tries to find the package.json and caches its contents
 */
FaviconsWebpackPlugin.prototype.findPackageJson = function (context) {
  this.pkg = this.pkg
    || util.readJSON(path.resolve(context, 'package.json'))
    || util.readJSON(path.resolve(context, '../package.json'))
    || {};

  return this.pkg;
}

/**
 * Tries to guess the name from the package.json
 */
FaviconsWebpackPlugin.prototype.guessAppName = function (context) {
  return this.findPackageJson(context).name;
}

/**
 * Tries to guess the description from the package.json
 */
FaviconsWebpackPlugin.prototype.guessDescription = function (context) {
  return this.findPackageJson(context).description;
}

/**
 * Tries to guess the version from the package.json
 */
FaviconsWebpackPlugin.prototype.guessVersion = function (context) {
  return this.findPackageJson(context).version;
}

/**
 * Tries to guess the author name from the package.json
 */
FaviconsWebpackPlugin.prototype.guessDeveloperName = function (context) {
  return util.getAuthor(this.findPackageJson(context)).name;
}

/**
 * Tries to guess the author URL from the package.json
 */
FaviconsWebpackPlugin.prototype.guessDeveloperURL = function (context) {
  return util.getAuthor(this.findPackageJson(context)).url;
}

module.exports = FaviconsWebpackPlugin;

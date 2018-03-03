'use strict';
const assert = require('assert');
const childCompiler = require('./lib/compiler.js');
const oracle = require('./lib/oracle.js');

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
    this.options.favicons.appName = oracle.guessAppName(compiler.context);
  }

  if (!this.options.favicons.appDescription) {
    this.options.favicons.appDescription = oracle.guessDescription(compiler.context);
  }

  if (!this.options.favicons.version) {
    this.options.favicons.version = oracle.guessVersion(compiler.context);
  }

  if (!this.options.favicons.developerName) {
    this.options.favicons.developerName = oracle.guessDeveloperName(compiler.context);
  }

  if (!this.options.favicons.developerURL) {
    this.options.favicons.developerURL = oracle.guessDeveloperURL(compiler.context);
  }

  // Generate favicons
  let compilationResult;
  compiler.plugin('make', (compilation, callback) => {
    childCompiler.compileTemplate(this.options, compiler.context, compilation)
      .then((result) => {
        compilationResult = result;
        callback();
      })
      .catch(callback);
  });

  const htmlWebpackPluginBeforeHtmlProcessing = (plugin) => {
    if (compiler.hooks) /* Webpack >= 4.0 */ {
      compiler.hooks.compilation.tap('HtmlWebpackPluginHooks', (compilation) => {
        if (compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
          compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('WebappWebpackPluginInjection', plugin);
        }
      });
    } else {
      compiler.plugin('compilation', (compilation) => {
        compilation.plugin('html-webpack-plugin-before-html-processing', plugin);
      });
    }
  };

  // Hook into the html-webpack-plugin processing
  // and add the html
  if (this.options.inject) {
    htmlWebpackPluginBeforeHtmlProcessing((htmlPluginData, callback) => {
      if (htmlPluginData.plugin.options.favicons !== false) {
        htmlPluginData.html = htmlPluginData.html.replace(/(<\/head>)/i, compilationResult.join('\n') + '$&');
      }
      callback(null, htmlPluginData);
    });
  }
};

module.exports = FaviconsWebpackPlugin;

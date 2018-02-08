'use strict';
var childCompiler = require('./lib/compiler.js');
var assert = require('assert');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function WebappWebpackPlugin (options) {
  if (typeof options === 'string') {
    options = {logo: options};
  }
  assert(typeof options === 'object', 'WebappWebpackPlugin options are required');
  assert(options.logo, 'An input file is required');
  this.options = _.extend({
    prefix: 'icons-[hash]/',
    inject: true,
    background: '#fff'
  }, options);
  this.options.icons = _.extend({
    android: true,
    appleIcon: true,
    appleStartup: true,
    coast: false,
    favicons: true,
    firefox: true,
    opengraph: false,
    twitter: false,
    yandex: false,
    windows: false
  }, this.options.icons);
}

WebappWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  if (!self.options.title) {
    self.options.title = guessAppName(compiler.context);
  }

  // Generate the favicons (webpack 4 compliant + back compat)
  var compilationResult;
  (compiler.hooks
    ? compiler.hooks.make.tapAsync.bind(compiler.hooks.make, 'FaviconsWebpackPluginMake')
    : compiler.plugin.bind(compiler, 'make')
  )((compilation, callback) => {
    childCompiler.compileTemplate(self.options, compiler.context, compilation)
      .then(function (result) {
        compilationResult = result;
        callback();
      })
      .catch(callback);
  });

  // Hook into the html-webpack-plugin processing
  // and add the html
  if (self.options.inject) {
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
        if (htmlPluginData.plugin.options.favicons !== false) {
          htmlPluginData.html = htmlPluginData.html.replace(
            /(<\/head>)/i, compilationResult.join('\n') + '$&');
        }
        callback(null, htmlPluginData);
      });
    } else {
      compiler.plugin('compilation', function (compilation) {
        compilation.plugin('html-webpack-plugin-before-html-processing', addFaviconsToHtml);
      });
    }
  }
};

/**
 * Tries to guess the name from the package.json
 */
function guessAppName (compilerWorkingDirectory) {
  var packageJson = path.resolve(compilerWorkingDirectory, 'package.json');
  if (!fs.existsSync(packageJson)) {
    packageJson = path.resolve(compilerWorkingDirectory, '../package.json');
    if (!fs.existsSync(packageJson)) {
      return 'Webpack App';
    }
  }
  return JSON.parse(fs.readFileSync(packageJson)).name;
}

module.exports = WebappWebpackPlugin;

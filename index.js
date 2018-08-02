'use strict';
var childCompiler = require('./lib/compiler.js');
var assert = require('assert');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function FaviconsWebpackPlugin (options) {
  if (typeof options === 'string') {
    options = {logo: options};
  }
  assert(typeof options === 'object', 'FaviconsWebpackPlugin options are required');
  assert(options.logo, 'An input file is required');
  this.options = _.extend({
    prefix: 'icons-[hash]/',
    emitStats: false,
    statsFilename: 'iconstats-[hash].json',
    persistentCache: true,
    inject: true,

    // Manifest configuration
    appName: null,
    appDescription: null,
    developerName: null,
    developerURL: null,
    dir: 'auto',
    lang: 'en-US',
    background: '#fff',
    theme_color: '#fff',
    appleStatusBarStyle: 'black-translucent',
    display: 'standalone',
    orientation: 'any',
    start_url: '/?homescreen=1',
    version: '1.0'
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

FaviconsWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  if (!self.options.appName) {
    self.options.appName = guessAppName(compiler.context);
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
    var addFaviconsToHtml = function (htmlPluginData, callback) {
      if (htmlPluginData.plugin.options.favicons !== false) {
        htmlPluginData.html = htmlPluginData.html.replace(
          /(<\/head>)/i, compilationResult.stats.html.join('') + '$&');
      }
      callback(null, htmlPluginData);
    };

    // webpack 4
    if (compiler.hooks) {
      compiler.hooks.compilation.tap('FaviconsWebpackPlugin', function (cmpp) {
        cmpp.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('favicons-webpack-plugin', addFaviconsToHtml);
      });
    } else {
      compiler.plugin('compilation', function (compilation) {
        compilation.plugin('html-webpack-plugin-before-html-processing', addFaviconsToHtml);
      });
    }
  }

  // Remove the stats from the output if they are not required (webpack 4 compliant + back compat)
  if (!self.options.emitStats) {
    (compiler.hooks
      ? compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, 'FaviconsWebpackPluginEmit')
      : compiler.plugin.bind(compiler, 'emit')
    )((compilation, callback) => {
      delete compilation.assets[compilationResult.outputName];
      callback();
    });
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

module.exports = FaviconsWebpackPlugin;

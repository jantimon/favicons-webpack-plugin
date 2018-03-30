'use strict';
var childCompiler = require('./lib/compiler.js');
var assert = require('assert');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function AppManifestWebpackPlugin (options) {
  if (typeof options === 'string') {
    options = {logo: options};
  }
  assert(typeof options === 'object', 'AppManifestWebpackPlugin options are required');
  assert(options.logo, 'An input file is required');
  this.options = _.extend({
    prefix: 'icons-[hash]/',
    emitStats: false,
    statsFilename: 'iconstats-[hash].json',
    persistentCache: true,
    inject: true,
  }, options);
  this.options.config = _.extend({
    appName: 'Webpack App', // Your application's name. `string`
    appDescription: null, // Your application's description. `string`
    developerName: null, // Your (or your developer's) name. `string`
    developerURL: null, // Your (or your developer's) URL. `string`
    display: 'standalone', // Android display: "browser" or "standalone". `string`
    start_url: '/', // Android start application's URL. `string`
    orientation: 'portrait',
    background: '#fff',
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: true,
      coast: false,
      favicons: true,
      firefox: true,
      opengraph: false,
      twitter: true,
      yandex: true,
      windows: true,
    },
  }, this.options.config);
}

AppManifestWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  if (!self.options.config.appName) {
    self.options.config.appName = guessAppName(compiler.context);
  }

  // Generate the favicons
  var compilationResult;
  compiler.plugin('make', function (compilation, callback) {
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
      var tapped = 0;
      compiler.hooks.compilation.tap('FaviconsWebpackPlugin', function (cmpp) {
        compiler.hooks.compilation.tap('HtmlWebpackPluginHooks', function () {
          if (!tapped++) {
            cmpp.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
              'app-manifest-webpack-plugin',
              addFaviconsToHtml
            );
          }
        });
      });
    } else {
      compiler.plugin('compilation', function (compilation) {
        compilation.plugin('html-webpack-plugin-before-html-processing', addFaviconsToHtml);
      });
    }
  }

  // Remove the stats from the output if they are not required
  if (!self.options.emitStats) {
    compiler.plugin('emit', function (compilation, callback) {
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

module.exports = AppManifestWebpackPlugin;

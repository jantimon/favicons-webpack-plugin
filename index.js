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
    filename: false,
    inject: true,
    background: '#fff',
    _emitStatsFile: false
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
  if (this.options.filename) {
    this.options._emitStatsFile = true;
  } else {
    this.options.filename = 'favicons-webpack-plugin-working-file';
  }
}

FaviconsWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  if (!self.options.title) {
    self.options.title = guessAppName(compiler);
  }

  var compilationResult;
  compiler.plugin('make', function (compilation, callback) {
    childCompiler.compileTemplate(self.options, compiler.context, compilation)
      .then(function (result) {
        compilationResult = result;
        callback();
      })
      .catch(callback);
  });

  if (self.options.inject) {
    // Hook into the html-webpack-plugin processing
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
        if (htmlPluginData.plugin.options.favicons !== false) {
          htmlPluginData.html = htmlPluginData.html.replace(/(<head[^>]*>)/i, '$1' + compilationResult.html.join(''));
          callback(null, htmlPluginData);
        }
      });
    });
  }

  if (!self.options._emitStatsFile) {
    compiler.plugin('emit', function (compilation, callback) {
      delete compilation.assets[self.options.filename];
      callback();
    });
  }
};

function guessAppName (compiler) {
  var packageJson = path.resolve(compiler.context, 'package.json');
  if (!fs.existsSync(packageJson)) {
    packageJson = path.resolve(compiler.context, '../package.json');
    if (!fs.existsSync(packageJson)) {
      return 'Webpack App';
    }
  }
  return JSON.parse(fs.readFileSync(packageJson)).name;
}

module.exports = FaviconsWebpackPlugin;

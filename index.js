'use strict';
var childCompiler = require('./lib/compiler.js');
var FaviconsCache = require('./lib/cache.js');
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
    persistentCache: false,
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

FaviconsWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  if (!self.options.title) {
    self.options.title = guessAppName(compiler.context);
  }

  // Generate the favicons - optionally use cache
  var cacheResult;
  var compilationResult;
  if (self.options.persistentCache) {
    var cache = new FaviconsCache(self.options, compiler.context);
    compiler.plugin('make', function (compilation, callback) {
      cache.fetch()
        .then(function (fetchResult) {
          cacheResult = fetchResult;
          cacheResult.getCachedCompilationResult()
            .then(
              function (cachedCompilationResult) {
                compilationResult = cachedCompilationResult;
                callback();
              },
              function () {
                childCompiler.compileTemplate(self.options, compiler.context, compilation)
                 .then(function (result) {
                   compilationResult = result;
                   callback();
                 });
              });
        })
        .catch(callback);
    });
  } else {
    compiler.plugin('make', function (compilation, callback) {
      childCompiler.compileTemplate(self.options, compiler.context, compilation)
        .then(function (result) {
          compilationResult = result;
          callback();
        })
      .catch(callback);
    });
  }

  // Hook into the html-webpack-plugin processing
  // and add the html
  if (self.options.inject) {
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
        if (htmlPluginData.plugin.options.favicons !== false) {
          htmlPluginData.html = htmlPluginData.html.replace(
            /(<head[^>]*>)/i, '$1' + compilationResult.stats.html.join(''));
          callback(null, htmlPluginData);
        }
      });
    });
  }

  // Remove the stats from the output if they are not required
  if (!self.options.emitStats) {
    compiler.plugin('emit', function (compilation, callback) {
      // if the results did not come from the cache, they will be in the  compilation
      // and must be removed
      if (!self.options.persistentCache || cacheResult.isMiss()) {
        delete compilation.assets[compilationResult.outputName];
      }
      callback();
    });
  }

  // copy cache files or add new files to cache
  if (self.options.persistentCache) {
    compiler.plugin('after-emit', function (compilation, callback) {
      cacheResult.postEmit(compilation.outputOptions.path, compilationResult)
        .then(function () {
          callback();
        })
        .catch(function (err) {
          callback(err);
        });
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

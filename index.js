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
    persistentCache: true,
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

  // use cache?
  var cache = false;
  var cacheHit = false;
  if (self.options.persistentCache) {
    cache = new FaviconsCache(compiler.context, compiler.outputPath, self.options);
  }

  // Generate the favicons
  var compilationResult;
  compiler.plugin('make', function (compilation, callback) {
    checkCache(function (err, cacheResult) {
      if (err) callback(err);
      cacheHit = cacheResult;
      if (cacheHit) {
        cacheHit.getCompilationResult(function (err, result){
          if (err) callback(err);
          compilationResult = result;
          callback();
        });
      } else {
        childCompiler.compileTemplate(self.options, compiler.context, compilation)
          .then(function (result) {
            compilationResult = result;
            callback();
          })
        .catch(callback);
      }
    }
  });

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
  if (!cacheHit && !self.options.emitStats) {
    compiler.plugin('emit', function (compilation, callback) {
      delete compilation.assets[compilationResult.outputName];
      callback();
    });
  }

  // copy cache files or add new files to cache
  if (self.options.peristentCache) {
    compiler.plugin('after-emit', function (compilation, callback) {
      if (cacheHit) {
        cacheHit.emit(callback);
      } else {
        cache.put(compilationResult, callback);
      }
    });
  }
};


function checkCache (cache, callback(err, cacheResult) ){
  if (cache) {
    cache.fetch( callback ); 
  } else {
    callback(null, false);
  }
}

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

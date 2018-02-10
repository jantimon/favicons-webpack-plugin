'use strict';
var childCompiler = require('./lib/compiler.js');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var parseAuthor = require('parse-author');

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
  var self = this;

  if (!self.options.favicons.appName) {
    self.options.favicons.appName = guessAppName(compiler.context);
  }

  if (!self.options.favicons.appDescription) {
    self.options.favicons.appDescription = guessDescription(compiler.context);
  }

  if (!self.options.favicons.version) {
    self.options.favicons.version = guessVersion(compiler.context);
  }

  if (!self.options.favicons.developerName) {
    self.options.favicons.developerName = guessDeveloperName(compiler.context);
  }

  if (!self.options.favicons.developerURL) {
    self.options.favicons.developerURL = guessDeveloperURL(compiler.context);
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
 * Reads file if it exists
 */
function readJSON (file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : undefined;
}

/**
 * Tries to find the package.json and caches its contents
 */
var _pkg = undefined;
function readPackageJson (compilerWorkingDirectory) {
  _pkg = _pkg
    || readJSON(path.resolve(compilerWorkingDirectory, 'package.json'))
    || readJSON(path.resolve(compilerWorkingDirectory, '../package.json'))
    || {};

  return _pkg;
}

/**
 * Tries to guess the name from the package.json
 */
function guessAppName (compilerWorkingDirectory) {
  return readPackageJson(compilerWorkingDirectory).name;
}

/**
 * Tries to guess the description from the package.json
 */
function guessDescription (compilerWorkingDirectory) {
  return readPackageJson(compilerWorkingDirectory).description;
}

/**
 * Tries to guess the version from the package.json
 */
function guessVersion (compilerWorkingDirectory) {
  return readPackageJson(compilerWorkingDirectory).version;
}

/**
 * Tries to guess the author name from the package.json
 */
function guessDeveloperName (compilerWorkingDirectory) {
  return parseAuthor(readPackageJson(compilerWorkingDirectory).author || "").name;
}

/**
 * Tries to guess the author URL from the package.json
 */
function guessDeveloperURL (compilerWorkingDirectory) {
  return parseAuthor(readPackageJson(compilerWorkingDirectory).author || "").url;
}

module.exports = FaviconsWebpackPlugin;

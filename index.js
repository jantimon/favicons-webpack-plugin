'use strict';
const childCompiler = require('./lib/compiler.js');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const parseAuthor = require('parse-author');

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
    this.options.favicons.appName = guessAppName(compiler.context);
  }

  if (!this.options.favicons.appDescription) {
    this.options.favicons.appDescription = guessDescription(compiler.context);
  }

  if (!this.options.favicons.version) {
    this.options.favicons.version = guessVersion(compiler.context);
  }

  if (!this.options.favicons.developerName) {
    this.options.favicons.developerName = guessDeveloperName(compiler.context);
  }

  if (!this.options.favicons.developerURL) {
    this.options.favicons.developerURL = guessDeveloperURL(compiler.context);
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

/**
 * Reads file if it exists
 */
function readJSON (file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : undefined;
}

/**
 * Tries to find the package.json and caches its contents
 */
let _pkg;
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

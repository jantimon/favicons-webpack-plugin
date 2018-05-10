'use strict';
const path = require('path');
const assert = require('assert');
const child = require('./compiler');
const Oracle = require('./oracle');
const {tap} = require('./compat');

module.exports = class FaviconsWebpackPlugin {
  constructor(args) {
    const options = (typeof args === 'string') ? {logo: args} : args;
    assert(typeof options === 'object' && typeof options.logo === 'string', 'An input file is required');

    this.options = Object.assign({
      cache: '.wwp-cache',
      prefix: 'assets/',
      favicons: {},
      inject: true,
    }, options);
  }

  apply(compiler) {
    const oracle = new Oracle(compiler.context);

    if (this.options.cache) {
      this.options.cache = path.resolve(compiler.context, this.options.cache);
    }

    {
      const {
        appName = oracle.guessAppName(),
        appDescription = oracle.guessDescription(),
        version = oracle.guessVersion(),
        developerName = oracle.guessDeveloperName(),
        developerURL = oracle.guessDeveloperURL(),
      } = this.options.favicons;

      Object.assign(this.options.favicons, {
        appName,
        appDescription,
        version,
        developerName,
        developerURL,
      });
    }

    tap(compiler, 'make', 'FaviconsWebpackPlugin', (compilation, callback) =>
      // Generate favicons
      child.run(this.options, compiler.context, compilation)
        .then(result => {
          if (this.options.inject) {
            // Hook into the html-webpack-plugin processing and add the html
            tap(compilation, 'html-webpack-plugin-before-html-processing', 'FaviconsWebpackPlugin', (htmlPluginData, callback) => {
              if (htmlPluginData.plugin.options.inject && htmlPluginData.plugin.options.favicons !== false) {
                htmlPluginData.html = htmlPluginData.html.replace(/(<\/head>)/i, result + '$&');
              }
              return callback(null, htmlPluginData);
            });
          }
          return callback();
        })
        .catch(callback)
    );
  }
}

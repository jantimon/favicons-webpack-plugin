const assert = require('assert');
const child = require('./compiler');
const Oracle = require('./oracle');
const { tap, tapHtml } = require('./compat');

module.exports = class FaviconsWebpackPlugin {
  constructor(args) {
    const options = (typeof args === 'string') ? { logo: args } : args;
    assert(typeof options === 'object' && typeof options.logo === 'string', 'An input file is required');

    this.options = Object.assign({
      cache: true,
      inject: true,
      favicons: {},
      prefix: 'assets/',
    }, options);
  }

  apply(compiler) {
    const oracle = new Oracle(compiler.context);

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

    if (typeof this.options.inject !== 'function') {
      const { inject } = this.options;
      this.options.inject = htmlPlugin =>
        inject === 'force'
        || htmlPlugin.options.favicons !== false && htmlPlugin.options.inject && inject;
    }

    tap(compiler, 'make', 'FaviconsWebpackPlugin', (compilation, callback) =>
      // Generate favicons
      child.run(this.options, compiler.context, compilation)
        .then(tags => {
          // Hook into the html-webpack-plugin processing and add the html
          tapHtml(compilation, 'FaviconsWebpackPlugin', (htmlPluginData, callback) => {
            if (this.options.inject(htmlPluginData.plugin)) {
              const idx = (htmlPluginData.html + '</head>').search(/<\/head>/i);
              htmlPluginData.html = [htmlPluginData.html.slice(0, idx), ...tags, htmlPluginData.html.slice(idx)].join('');
            }
            return callback(null, htmlPluginData);
          });
          return callback();
        })
        .catch(callback)
    );
  }
}

const assert = require('assert');
const child = require('./compiler');
const Oracle = require('./oracle');
const {tap} = require('./compat');

module.exports = class FaviconsWebpackPlugin {
  constructor(args) {
    const options = (typeof args === 'string') ? {logo: args} : args;
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

    tap(compiler, 'make', 'FaviconsWebpackPlugin', (compilation, callback) =>
      // Generate favicons
      child.run(this.options, compiler.context, compilation)
        .then(result => {
          if (this.options.inject) {
            // Hook into the html-webpack-plugin processing and add the html
            tap(compilation, 'html-webpack-plugin-before-html-processing', 'FaviconsWebpackPlugin', (htmlPluginData, callback) => {
              const htmlPluginDataInject  = htmlPluginData.plugin.options.inject && htmlPluginData.plugin.options.favicons !== false;
              if ( htmlPluginDataInject || this.options.inject === 'force') {
                  let position = htmlPluginData.html.search(/<\/head>/i);
                  position = position === -1 ? htmlPluginData.html.length : position;
                  htmlPluginData.html = [htmlPluginData.html.slice(0, position), result, htmlPluginData.html.slice(position)].join('');
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

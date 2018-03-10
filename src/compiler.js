'use strict';
const path = require('path');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

const util = require('./util.js');

module.exports.compileTemplate = function compileTemplate (options, context, compilation) {
  // The entry file is just an empty helper as the dynamic template
  // require is added in "loader.js"
  const outputOptions = {
    filename: '[hash]',
    publicPath: compilation.outputOptions.publicPath
  };
  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  const childCompiler = compilation.createChildCompiler('favicons-webpack-plugin', outputOptions);
  childCompiler.context = context;
  new SingleEntryPlugin(context, '!!' + require.resolve('./favicons') + '?' +
    JSON.stringify({
      outputFilePrefix: options.prefix,
      faviconsOptions: options.favicons,
    }) + '!' + options.logo
  ).apply(childCompiler);

  // Compile and return a promise
  return new Promise((resolve, reject) => {
    childCompiler.runAsChild((err, entries, childCompilation) => {
      if (childCompilation && childCompilation.errors && childCompilation.errors.length) {
        const errorDetails = childCompilation.errors.map((error) =>
          error.message + (error.error ? ':\n' + error.error : '')
        ).join('\n');
        reject(new Error('Child compilation failed:\n' + errorDetails));
      } else if (err) {
        reject(err);
      } else {
        // Replace [hash] placeholders in filename
        const outputName = util.getAssetPath(compilation.mainTemplate, outputOptions.filename, {
          hash: childCompilation.hash,
          chunk: entries[0]
        });

        const stats = eval(childCompilation.assets[outputName].source());
        delete compilation.assets[outputName];
        childCompilation.assets = {};
        resolve(stats);
      }
    });
  });
};

/**
 * Returns the child compiler name e.g. 'html-webpack-plugin for "index.html"'
 */
function getCompilerName (context, filename) {
  var absolutePath = path.resolve(context, filename);
  var relativePath = path.relative(context, absolutePath);
  return 'favicons-webpack-plugin for "' + (absolutePath.length < relativePath.length ? absolutePath : relativePath) + '"';
}

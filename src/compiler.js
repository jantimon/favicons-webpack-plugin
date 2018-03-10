'use strict';
const path = require('path');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const {getAssetPath} = require('./util');

module.exports.run = ({prefix, favicons, logo}, context, compilation) => {
  // The entry file is just an empty helper
  const filename = '[hash]';
  const publicPath = compilation.outputOptions.publicPath;

  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  const compiler = compilation.createChildCompiler('favicons-webpack-plugin', {filename, publicPath});
  compiler.context = context;

  const loader = require.resolve('./favicons');
  const query = JSON.stringify({prefix, options: favicons});

  new SingleEntryPlugin(context, `!!${loader}?${query}!${logo}`).apply(compiler);

  // Compile and return a promise
  return new Promise((resolve, reject) => {
    compiler.runAsChild((err, [chunk] = [], {hash, errors = [], assets = {}} = {}) => {
      if (err) {
        return reject(err);
      }

      if (errors.length) {
        const details = errors.map(({error, message}) => message + (error ? ':\n' + error : '')).join('\n');
        return reject(new Error('Child compilation failed:\n' + details));
      }

      // Replace [hash] placeholders in filename
      const output = getAssetPath(compilation, filename, {hash, chunk});
      const stats = eval(assets[output].source());
      delete compilation.assets[output];
      for (const key in assets)
        delete assets[key];

      return resolve(stats);
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

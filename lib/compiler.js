'use strict';
var path = require('path');
var SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

module.exports.compileTemplate = function compileTemplate (options, context, compilation) {
  // The entry file is just an empty helper as the dynamic template
  // require is added in "loader.js"
  var outputOptions = {
    filename: '[hash]',
    publicPath: compilation.outputOptions.publicPath
  };
  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  var childCompiler = compilation.createChildCompiler('favicon-webpack-plugin', outputOptions);
  childCompiler.context = context;
  childCompiler.apply(
    new SingleEntryPlugin(context, '!!' + require.resolve('./favicons.js') + '?' +
      JSON.stringify({
        outputFilePrefix: options.prefix,
        icons: options.icons,
        background: options.background,
        appName: options.title
      }) + '!' + options.logo)
  );

  childCompiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
      if (!chunks[0]) {
        return callback(compilation.errors[0] || 'Favicons generation failed');
      }
      var resultFile = chunks[0].files[0];
      var resultCode = compilation.assets[resultFile].source();
      var resultJson;
      try {
        var result = eval(resultCode);
        resultJson = JSON.stringify(result);
      } catch (e) {
        return callback(e);
      }
      compilation.assets[resultFile] = {
        source: function () {
          return resultJson;
        },
        size: function () {
          return resultJson.length;
        }
      };
      callback(null);
    });
  });

  // Compile and return a promise
  return new Promise(function (resolve, reject) {
    childCompiler.runAsChild(function (err, entries, childCompilation) {
      // Resolve / reject the promise
      if (childCompilation && childCompilation.errors && childCompilation.errors.length) {
        var errorDetails = childCompilation.errors.map(function (error) {
          return error.message + (error.error ? ':\n' + error.error : '');
        }).join('\n');
        reject(new Error('Child compilation failed:\n' + errorDetails));
      } else if (err) {
        reject(err);
      } else {
        // Replace [hash] placeholders in filename
        var outputName = compilation.mainTemplate.applyPluginsWaterfall('asset-path', outputOptions.filename, {
          hash: childCompilation.hash,
          chunk: entries[0]
        });
        var stats = JSON.parse(childCompilation.assets[outputName].source());
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

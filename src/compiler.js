const path = require('path');
const msgpack = require('msgpack-lite');
const findCacheDir = require('find-cache-dir');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const {getAssetPath} = require('./compat');

module.exports.run = ({prefix, favicons: options, logo, cache}, context, compilation) => {
  // The entry file is just an empty helper
  const filename = '[hash]';
  const {publicPath = '/'} = compilation.outputOptions;

  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  const compiler = compilation.createChildCompiler('favicons-webpack-plugin', {filename, publicPath});
  compiler.context = context;

  const loader = `!${require.resolve('./loader')}?${JSON.stringify({prefix, options, path: publicPath})}`;

  const cacheDirectory = cache && (
      (typeof cache === 'string')
    ? path.resolve(context, cache)
    : findCacheDir({name: 'favicons-webpack-plugin', cwd: context}) || path.resolve(__dirname, '.cache')
  );

  const cacher = cacheDirectory
    ? `!${require.resolve('cache-loader')}?${JSON.stringify({cacheDirectory})}`
    : ''
  ;

  new SingleEntryPlugin(context, `!${cacher}${loader}!${logo}`, path.basename(logo)).apply(compiler);

  // Compile and return a promise
  return new Promise((resolve, reject) => {
    compiler.runAsChild((err, [chunk] = [], {hash, errors = [], assets = {}} = {}) => {
      if (err || errors.length) {
        return reject(err || errors[0].error);
      }

      // Replace [hash] placeholders in filename
      const output = getAssetPath(compilation, filename, {hash, chunk});
      const result = msgpack.decode(Buffer.from(eval(assets[output].source()), 'base64'));

      delete compilation.assets[output];
      for (const {name, contents} of result.assets) {
        compilation.assets[name] = {
          source: () => contents,
          size: () => contents.length,
        };
      }

      return resolve(result.html);
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

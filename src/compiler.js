const path = require('path');
const findCacheDir = require('find-cache-dir');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

module.exports.run = async ({ prefix, favicons: options, logo, cache, publicPath: publicPathOption, outputPath }, context, compilation) => {
  // The entry file is just an empty helper
  const filename = '[hash]';
  const publicPath = typeof publicPathOption !== 'undefined' ? publicPathOption : ( typeof compilation.outputOptions.publicPath !== 'undefined' ? compilation.outputOptions.publicPath : '/');

  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  const compiler = compilation.createChildCompiler('favicons-webpack-plugin', { filename, publicPath });
  compiler.context = context;

  const cacheDirectory = cache && (
    (typeof cache === 'string')
      ? path.resolve(context, cache)
      : findCacheDir({ name: 'favicons-webpack-plugin', cwd: context }) || path.resolve(context, '.wwp-cache')
  );

  const cacheLoader = cacheDirectory
    ? `!${require.resolve('cache-loader')}?${JSON.stringify({ cacheDirectory })}`
    : ''
    ;

  const faviconsLoader = `${require.resolve('./loader')}?${JSON.stringify({ prefix, options, path: publicPath, outputPath })}`;

  new SingleEntryPlugin(context, `!${cacheLoader}!${faviconsLoader}!${logo}`, path.basename(logo)).apply(compiler);

  // Compile and return a promise
  const { chunk, hash, assets } = await new Promise((resolve, reject) => {
    return compiler.runAsChild((err, [chunk] = [], { hash, errors = [], assets = {} } = {}) => {
      if (err || errors.length) {
        return reject(err || errors[0].error);
      }

      return resolve({ chunk, hash, assets });
    });
  });

  // Replace [hash] placeholders in filename
  const assetPath = compilation.mainTemplate.getAssetPath(filename, { hash, chunk });
  const { tags, assets: files } = eval(assets[assetPath].source());
  delete compilation.assets[assetPath];

  for (const { name, contents } of files) {
    const binaryContents = Buffer.from(contents, 'base64');
    compilation.assets[name] = {
      source: () => binaryContents,
      size: () => binaryContents.length
    };
  }

  return tags;
};

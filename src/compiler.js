const path = require('path');
const findCacheDir = require('find-cache-dir');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

module.exports.run = (faviconOptions, context, compilation) => {
  const {
    prefix,
    favicons: options,
    logo,
    cache,
    publicPath: publicPathOption,
    outputPath
  } = faviconOptions;
  // The entry file is just an empty helper
  const filename = '[hash]';
  const publicPath = getPublicPath(
    publicPathOption,
    compilation.outputOptions.publicPath
  );

  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  const compiler = compilation.createChildCompiler('favicons-webpack-plugin', {
    filename,
    publicPath
  });
  compiler.context = context;

  const cacheDirectory =
    cache &&
    (typeof cache === 'string'
      ? path.resolve(context, cache)
      : findCacheDir({ name: 'favicons-webpack-plugin', cwd: context }) ||
        path.resolve(context, '.wwp-cache'));

  const cacheLoader = cacheDirectory
    ? `!${require.resolve('cache-loader')}?${JSON.stringify({
        cacheDirectory
      })}`
    : '';
  const faviconsLoader = `${require.resolve('./loader')}?${JSON.stringify({
    prefix,
    options,
    path: publicPath,
    outputPath
  })}`;

  const logoCompilationEntry = new SingleEntryPlugin(
    context,
    `!${cacheLoader}!${faviconsLoader}!${logo}`,
    path.basename(logo)
  );
  logoCompilationEntry.apply(compiler);

  // Compile and return a promise
  return new Promise((resolve, reject) => {
    compiler.runAsChild((err, [chunk] = [], { hash, errors = [] } = {}) => {
      if (err || errors.length) {
        return reject(err || errors[0].error);
      }

      // Replace [hash] placeholders in filename
      const result = extractAssetFromCompilation(
        compilation,
        compilation.mainTemplate.getAssetPath(filename, { hash, chunk })
      );

      for (const { name, contents } of result.assets) {
        const binaryContents = Buffer.from(contents, 'base64');
        compilation.assets[name] = {
          source: () => binaryContents,
          size: () => binaryContents.length
        };
      }

      return resolve(result.tags);
    });
  });
};

function extractAssetFromCompilation(compilation, assetPath) {
  const content = compilation.assets[assetPath].source();
  delete compilation.assets[assetPath];

  /* eslint-disable no-eval */
  return eval(content);
}

/**
 * faviconsPublicPath always wins over compilerPublicPath
 * If both are undefined fallback to '/'
 */
function getPublicPath(faviconsPublicPath, compilerPublicPath) {
  return faviconsPublicPath !== undefined
    ? faviconsPublicPath
    : compilerPublicPath !== undefined
    ? compilerPublicPath
    : '/';
}
module.exports.getPublicPath = getPublicPath;

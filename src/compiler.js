const path = require('path');
const findCacheDir = require('find-cache-dir');
const entryPlugin = require('webpack/lib/EntryPlugin');
const Compilation = require('webpack').Compilation;

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
  const filename = 'favicon-[fullhash]';
  const publicPath = getPublicPath(
    publicPathOption,
    compilation.outputOptions.publicPath
  );

  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  const childCompiler = compilation.createChildCompiler(
    'favicons-webpack-plugin',
    {
      filename,
      publicPath,
      libraryTarget: 'var',
      iife: false
    }
  );
  childCompiler.context = context;

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

  const logoCompilationEntry = new entryPlugin(
    context,
    `!${cacheLoader}!${faviconsLoader}!${logo}`,
    path.basename(logo)
  );
  logoCompilationEntry.apply(childCompiler);

  /** @type {Promise<{ tags: Array<string>, assets: Array<{name: string, contents: string}> }>} */
  const compiledFavicons = new Promise((resolve, reject) => {
    /** @type {Array<import('webpack').sources.CachedSource>} extracted webpack assets */
    const extractedAssets = [];
    childCompiler.hooks.thisCompilation.tap(
      'FaviconsWebpackPlugin',
      compilation => {
        compilation.hooks.processAssets.tap(
          {
            name: 'FaviconsWebpackPlugin',
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
          },
          assets => {
            Object.keys(assets)
              .filter(temporaryTemplateName =>
                temporaryTemplateName.startsWith('favicon-')
              )
              .forEach(temporaryTemplateName => {
                if (assets[temporaryTemplateName]) {
                  extractedAssets.push(assets[temporaryTemplateName]);
                  compilation.deleteAsset(temporaryTemplateName);
                }
              });
            if (extractedAssets.length > 1) {
              reject('Unexpected multiplication of favicon generations');

              return;
            }
            const extractedAsset = extractedAssets[0];
            if (extractedAsset) {
              /**
               * @type {{ tags: Array<string>, assets: Array<{name: string, contents: string}> }}
               * The extracted result of the favicon-webpack-plugin loader
               */
              const result = eval(extractedAsset.source().toString()); // eslint-disable-line
              if (result && result.assets) {
                resolve(result);
              }
            }
          }
        );
      }
    );
    childCompiler.runAsChild((err, result, { errors = [] } = {}) => {
      if (err || errors.length) {
        return reject(err || errors[0].error);
      }
      // If no error occured and this promise was not resolved inside the `processAssets` hook
      // reject the promise although it's unclear why it failed:
      reject('Could not extract assets');
    });
  });

  return compiledFavicons.then(faviconCompilationResult => {
    return {
      assets: faviconCompilationResult.assets.map(({ name, contents }) => ({
        name,
        contents: Buffer.from(contents, 'base64')
      })),
      tags: faviconCompilationResult.tags
    };
  });
};

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

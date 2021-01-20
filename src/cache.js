// / @ts-check

// Import types
/** @typedef {ReturnType<import("webpack").Compiler['getCache']>} WebpackCacheFacade */
/** @typedef {import("webpack").Compilation} WebpackCompilation */
/** @typedef {Parameters<WebpackCompilation['fileSystemInfo']['checkSnapshotValid']>[0]} Snapshot */

/** @typedef {{,
  publicPath: string,
  tags: string[], 
  assets: Array<{
    name: string, 
    contents: import('webpack').sources.RawSource
  }>
}} FaviconsCompilationResult */

const path = require('path');
const {
  replaceContentHash,
  resolvePublicPath,
  getContentHash
} = require('./hash');

/** @type {WeakMap<any, Promise<Snapshot>>} */
const snapshots = new WeakMap();
/** @type {WeakMap<Promise<Snapshot>, Promise<FaviconsCompilationResult>>} */
const faviconCache = new WeakMap();

/**
 * Executes the generator function and caches the result in memory
 * The cache will be invalidated after the logo source file was modified
 *
 * @param {import('./options').FaviconWebpackPlugionInternalOptions} faviconOptions
 * @param {string} context - the compiler.context patth
 * @param {WebpackCompilation} compilation - the current webpack compilation
 * @param {any} pluginInstance - the plugin instance to use as cache key
 * @param {(
      logoSource: Buffer | string,
      compilation: WebpackCompilation, 
      resolvedPublicPath: string, 
      outputPath: string
    ) => Promise<FaviconsCompilationResult>
  } generator
 *
 * @returns {Promise<FaviconsCompilationResult>}
 */
function runCached(
  faviconOptions,
  context,
  compilation,
  pluginInstance,
  generator
) {
  const { logo } = faviconOptions;

  const latestSnapShot = snapshots.get(pluginInstance);
  const cachedFavicons = latestSnapShot && faviconCache.get(latestSnapShot);

  if (latestSnapShot && cachedFavicons) {
    return isSnapShotValid(latestSnapShot, compilation).then(isValid => {
      // If the source files have changed clear all caches
      // and try again
      if (!isValid) {
        faviconCache.delete(latestSnapShot);

        return runCached(
          faviconOptions,
          context,
          compilation,
          pluginInstance,
          generator
        );
      }

      // If the cache is valid return the result directly from cache
      return cachedFavicons;
    });
  }

  // Store a snapshot of the filesystem
  // to find out if the logo was changed
  const newSnapShot = createSnapshot(
    {
      fileDependencies: [logo],
      contextDependencies: [],
      missingDependencies: []
    },
    compilation
  );
  snapshots.set(pluginInstance, newSnapShot);

  // Start generating the favicons
  const faviconsGenerationsPromise = runWithFileCache(
    faviconOptions,
    context,
    compilation,
    generator
  );

  // Store the promise of the favicon compilation in cache
  faviconCache.set(newSnapShot, faviconsGenerationsPromise);

  return faviconsGenerationsPromise;
}

/**
 * Create a snapshot
 * @param {{fileDependencies: string[], contextDependencies: string[], missingDependencies: string[]}} fileDependencies
 * @param {WebpackCompilation} mainCompilation
 * @returns {Promise<Snapshot>}
 */
function createSnapshot(fileDependencies, mainCompilation) {
  return new Promise((resolve, reject) => {
    mainCompilation.fileSystemInfo.createSnapshot(
      new Date().getTime(),
      fileDependencies.fileDependencies,
      fileDependencies.contextDependencies,
      fileDependencies.missingDependencies,
      {},
      (err, snapshot) => {
        if (err || !snapshot) {
          return reject(err || new Error('Could not create Snapshot'));
        }
        resolve(snapshot);
      }
    );
  });
}

/**
 * Executes the generator function and stores it in the webpack file cache
 *
 * @param {import('./options').FaviconWebpackPlugionInternalOptions} faviconOptions
 * @param {string} context - the compiler.context patth
 * @param {WebpackCompilation} compilation - the current webpack compilation
 * @param {(
      logoSource: Buffer | string,
      compilation: WebpackCompilation, 
      resolvedPublicPath: string, 
      outputPath: string
    ) => Promise<FaviconsCompilationResult>
  } generator
 *
 * @returns {Promise<FaviconsCompilationResult>}
 */
async function runWithFileCache(
  faviconOptions,
  context,
  compilation,
  generator
) {
  const { logo } = faviconOptions;
  const logoSource = await new Promise((resolve, reject) =>
    compilation.inputFileSystem.readFile(
      path.resolve(context, logo),
      (error, fileBuffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(fileBuffer);
        }
      }
    )
  );

  const compilationOutputPath =
    compilation.outputOptions.path === 'auto'
      ? ''
      : compilation.outputOptions.path || '';
  /**
   * the relative output path to the folder where the favicon files should be generated to
   * it might include tokens like [fullhash] or [contenthash]
   */
  const relativeOutputPath = faviconOptions.outputPath
    ? path.relative(
        compilationOutputPath,
        path.resolve(compilationOutputPath, faviconOptions.outputPath)
      )
    : faviconOptions.prefix;

  const logoContentHash = getContentHash(logoSource);
  const executeGenerator = () => {
    const outputPath = replaceContentHash(
      compilation,
      relativeOutputPath,
      logoContentHash
    );
    const webpackPublicPath =
      compilation.outputOptions.publicPath === 'auto'
        ? ''
        : compilation.outputOptions.publicPath;
    const resolvedPublicPath = replaceContentHash(
      compilation,
      resolvePublicPath(
        compilation,
        faviconOptions.publicPath || webpackPublicPath,
        faviconOptions.prefix
      ),
      logoContentHash
    );
    return generator(logoSource, compilation, resolvedPublicPath, outputPath);
  };

  if (faviconOptions.cache === false) {
    return executeGenerator();
  }

  const webpackCache = compilation.getCache('favicons-webpack-plugin');
  // Cache invalidation token
  const eTag = [
    JSON.stringify(faviconOptions.publicPath),
    JSON.stringify(faviconOptions.mode),
    // Recompile filesystem cache if the user change the favicon options
    JSON.stringify(faviconOptions.favicons),
    // Recompile filesystem cache if the logo source changes:
    logoContentHash
  ].join('\n');

  // Use the webpack cache which supports filesystem caching to improve build speed
  // See also https://webpack.js.org/configuration/other-options/#cache
  // Create one cache for every output target
  return webpackCache.providePromise(
    relativeOutputPath,
    eTag,
    executeGenerator
  );
}

/**
 * Returns true if the files inside this snapshot
 * have not been changed
 *
 * @param {Promise<Snapshot>} snapshotPromise
 * @param {WebpackCompilation} mainCompilation
 * @returns {Promise<boolean>}
 */
function isSnapShotValid(snapshotPromise, mainCompilation) {
  return snapshotPromise.then(
    snapshot =>
      new Promise((resolve, reject) => {
        mainCompilation.fileSystemInfo.checkSnapshotValid(
          snapshot,
          (err, isValid) => {
            if (err) {
              reject(err);
            }
            resolve(Boolean(isValid));
          }
        );
      })
  );
}

module.exports = { runCached };

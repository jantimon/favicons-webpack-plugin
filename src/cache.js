// @ts-check

// Import types
/** @typedef {import("webpack").Compilation} WebpackCompilation */
/** @typedef {Parameters<WebpackCompilation['fileSystemInfo']['checkSnapshotValid']>[0]} Snapshot */

const path = require('path');
const { getContentHash } = require('./hash');

/**
 * Executes asynchronous function with a callback-style calling convention and returns a promise.
 *
 * @template T, E
 *
 * @param {(cb: (error: E, result: T) => void) => void} func
 * @returns {Promise<T, E>}
 */
function asPromise(func) {
  return new Promise((resolve, reject) => {
    /** @type {(error: E, result: T) => void} */
    const cb = (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    };
    func(cb);
  });
}

/** @type {WeakMap<any, Promise<Snapshot>>} */
const snapshots = new WeakMap();
/** @type {WeakMap<Promise<Snapshot>, Promise<any>>} */
const faviconCache = new WeakMap();

/**
 * Executes the generator function and caches the result in memory
 * The cache will be invalidated after the logo source file was modified
 *
 * @template TResult
 *
 * @param {string[]} absoluteFilePaths - file paths used used by the generator
 * @param {any} pluginInstance - the plugin instance to use as cache key
 * @param {boolean} useWebpackCache - Support webpack built in cache
 * @param {WebpackCompilation} compilation - the current webpack compilation
 * @param {string[]} eTags - eTags to verify the string
 * @param {(files: { filePath: string, hash: string, content: Buffer }[]) => string} idGenerator
 * @param {(files: { filePath: string, hash: string, content: Buffer }[], id: string) => Promise<TResult>} generator
 *
 * @returns {Promise<TResult>}
 */
function runCached(
  absoluteFilePaths,
  pluginInstance,
  useWebpackCache,
  compilation,
  eTags,
  idGenerator,
  generator
) {
  const latestSnapShot = snapshots.get(pluginInstance);

  /** @type {Promise<TResult> | undefined} */
  const cachedFavicons = latestSnapShot && faviconCache.get(latestSnapShot);

  if (latestSnapShot && cachedFavicons) {
    return isSnapShotValid(latestSnapShot, compilation).then((isValid) => {
      // If the source files have changed clear all caches
      // and try again
      if (!isValid) {
        faviconCache.delete(latestSnapShot);

        return runCached(
          absoluteFilePaths,
          pluginInstance,
          useWebpackCache,
          compilation,
          eTags,
          idGenerator,
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
      fileDependencies: absoluteFilePaths.filter(Boolean),
      contextDependencies: [],
      missingDependencies: [],
    },
    compilation
  );
  snapshots.set(pluginInstance, newSnapShot);

  // Start generating the favicons
  const faviconsGenerationsPromise = useWebpackCache
    ? runWithFileCache(
        absoluteFilePaths,
        compilation,
        idGenerator,
        eTags,
        generator
      )
    : readFiles(absoluteFilePaths, compilation).then((fileContents) =>
        generator(fileContents, idGenerator(fileContents))
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
async function createSnapshot(fileDependencies, mainCompilation) {
  const snapshot = await asPromise((cb) =>
    mainCompilation.fileSystemInfo.createSnapshot(
      new Date().getTime(),
      fileDependencies.fileDependencies,
      fileDependencies.contextDependencies,
      fileDependencies.missingDependencies,
      {},
      cb
    )
  );

  if (!snapshot) {
    throw new Error('Could not create Snapshot');
  }

  return snapshot;
}

/**
 *
 * Use the webpack cache which supports filesystem caching to improve build speed
 * See also https://webpack.js.org/configuration/other-options/#cache
 * Create one cache for every output target
 *
 * Executes the generator function and stores it in the webpack file cache
 * @template TResult
 *
 * @param {string[]} files - the file pathes to be watched for changes
 * @param {WebpackCompilation} compilation - the current webpack compilation
 * @param {(files: { filePath: string, hash: string, content: Buffer }[]) => string} idGenerator
 * @param {string[]} eTags - eTags to verify the string
 * @param {(files: { filePath: string, hash: string, content: Buffer }[], id: string) => Promise<TResult>} generator
 *
 * @returns {Promise<TResult>}
 */
async function runWithFileCache(
  files,
  compilation,
  idGenerator,
  eTags,
  generator
) {
  const fileSources = await readFiles(files, compilation);
  const webpackCache = compilation.getCache('favicons-webpack-plugin');
  // Cache invalidation token
  const eTag = [...eTags, fileSources.map(({ hash }) => hash)].join(' ');
  const cacheId = idGenerator(fileSources);

  return webpackCache.providePromise(cacheId, eTag, () =>
    generator(fileSources, cacheId)
  );
}

/**
 * readFiles and get content hashes
 *
 * @param {string[]} absoluteFilePaths
 * @param {WebpackCompilation} compilation
 * @returns {Promise<{filePath: string, hash: string, content: Buffer}[]>}
 */
function readFiles(absoluteFilePaths, compilation) {
  return Promise.all(
    absoluteFilePaths.map(async (absoluteFilePath) => {
      if (!absoluteFilePath) {
        return { filePath: absoluteFilePath, hash: '', content: '' };
      }

      const content = await asPromise((cb) =>
        compilation.inputFileSystem.readFile(
          path.resolve(compilation.compiler.context, absoluteFilePath),
          cb
        )
      );

      return {
        filePath: absoluteFilePath,
        hash: getContentHash(content),
        content,
      };
    })
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
async function isSnapShotValid(snapshotPromise, mainCompilation) {
  const snapshot = await snapshotPromise;
  const isValid = await asPromise((cb) =>
    mainCompilation.fileSystemInfo.checkSnapshotValid(snapshot, cb)
  );

  return Boolean(isValid);
}

module.exports = { runCached };

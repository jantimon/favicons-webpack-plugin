/**
 * @file this file is responsible for the persitance disk caching
 * it offers helpers to prevent recompilation of the favicons on
 * every build
 */
'use strict'
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * Stores the given iconResult together with the control hashes as JSON file
 */
function emitCacheInformationFile(loader, query, cacheFile, fileHash, iconResult) {
  if (!query.persistentCache) {
    return
  }
  loader.emitFile(
    cacheFile,
    JSON.stringify({
      hash: fileHash,
      optionHash: generateHashForOptions(query),
      result: iconResult,
    }),
  )
}

/**
 * Checks if the given cache object is still valid
 *
 * @param {object} cache
 * @param {string} fileHash
 * @param {object} query
 */
function isCacheValid(cache, fileHash, query) {
  // Verify that the source file is the same
  // console.log('query', query)
  // console.log('generateHashForOptions(query)', generateHashForOptions(query))
  // console.log('cache.hash === fileHash', cache.hash === fileHash)
  // console.log('cache.optionHash', cache.optionHash)
  return (
    cache.hash === fileHash &&
    // Verify that the options are the same
    cache.optionHash === generateHashForOptions(query)
  )
}

/**
 * Try to load the file from the disc cache
 */
function loadIconsFromDiskCache(loader, query, cacheFile, fileHash, callback) {
  // Stop if cache is disabled
  if (!query.persistentCache) return callback(null)

  const resolvedCacheFile = path.resolve(
    loader._compiler.parentCompilation.compiler.outputPath,
    cacheFile,
  )

  if (!fs.existsSync(resolvedCacheFile)) return callback(null)

  fs.readFile(resolvedCacheFile, (err, content) => {
    if (err) return callback(err)

    let cache

    try {
      cache = JSON.parse(content)
      // Bail out if the file or the option changed
      if (!isCacheValid(cache, fileHash, query)) {
        return callback(null)
      }
    } catch (err) {
      return callback(err)
    }

    callback(null, cache.result)
  })
}

/**
 * Generates a md5 hash for the given options
 */
function generateHashForOptions(options) {
  const hash = crypto.createHash('md5')
  hash.update(JSON.stringify(options))
  return hash.digest('hex')
}

module.exports = {
  loadIconsFromDiskCache: loadIconsFromDiskCache,
  emitCacheInformationFile: emitCacheInformationFile,
}

const loaderUtils = require('loader-utils')
const favicons = require('favicons')
const faviconPersitenceCache = require('./cache')

module.exports = function(content) {
  const self = this
  self.cacheable && this.cacheable()

  if (!self.emitFile) throw new Error('emitFile is required from module system')
  if (!self.async) throw new Error('async is required')

  const callback = self.async()
  const query = loaderUtils.parseQuery(self.query)

  const pathPrefix = loaderUtils.interpolateName(self, query.outputFilePrefix, {
    context: query.context || this.rootContext || this.options.context,
    content: content,
    regExp: query.regExp,
  })

  const outputDir = loaderUtils.interpolateName(self, query.outputFilesDir, {
    context: query.context || this.rootContext || this.options.context,
    content: content,
    regExp: query.regExp,
  })

  const fileHash = loaderUtils.interpolateName(self, '[hash]', {
    context: query.context || this.rootContext || this.options.context,
    content: content,
  })

  const cacheFile = '.cache'

  faviconPersitenceCache.loadIconsFromDiskCache(
    self,
    query,
    cacheFile,
    fileHash,
    (err, cachedResult) => {
      if (err) return callback(err)
      if (cachedResult) {
        return callback(null, 'module.exports = ' + JSON.stringify(cachedResult))
      }
      // Generate icons
      generateIcons(self, content, pathPrefix, outputDir, query, function(err, iconResult) {
        if (err) return callback(err)
        faviconPersitenceCache.emitCacheInformationFile(
          self,
          query,
          cacheFile,
          fileHash,
          iconResult,
        )
        callback(null, 'module.exports = ' + JSON.stringify(iconResult))
      })
    },
  )
}

function generateIcons(loader, imageFileStream, pathPrefix, outputDir, query, callback) {
  query.config.path = pathPrefix

  favicons(imageFileStream, query.config, (err, response) => {
    if (err) return callback(err)

    // Filenames for cache file
    const fileNames = []

    response.images.forEach(image => {
      fileNames.push(pathPrefix + image.name)
      loader.emitFile((outputDir || pathPrefix) + image.name, image.contents)
    })

    response.files.forEach(file => {
      fileNames.push(pathPrefix + file.name)
      loader.emitFile((outputDir || pathPrefix) + file.name, file.contents)
    })

    callback(null, {
      outputFilePrefix: pathPrefix,
      html: response.html,
      files: fileNames,
    })
  })
}

module.exports.raw = true

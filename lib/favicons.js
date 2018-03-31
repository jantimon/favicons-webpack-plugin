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
      generateIcons(self, content, query, function(err, iconResult) {
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

function generateIcons(loader, imageFileStream, query, callback) {
  favicons(imageFileStream, query.config, (err, response) => {
    if (err) return callback(err)

    // Filenames for cache file
    const fileNames = []

    response.images.forEach(image => {
      fileNames.push(query.config.path + image.name)
      loader.emitFile(query.config.path + image.name, image.contents)
    })

    response.files.forEach(file => {
      fileNames.push(query.config.path + file.name)
      loader.emitFile(query.config.path + file.name, file.contents)
    })

    callback(null, {
      html: response.html,
      files: fileNames,
    })
  })
}

module.exports.raw = true

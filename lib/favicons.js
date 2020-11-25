const loaderUtils = require('loader-utils')
const favicons = require('favicons')
const faviconPersitenceCache = require('./cache')
const path = require('path')

module.exports = function(content) {
  const self = this
  self.cacheable && this.cacheable()

  if (!self.emitFile) throw new Error('emitFile is required from module system')
  if (!self.async) throw new Error('async is required')

  const callback = self.async()
  const query = loaderUtils.parseQuery(self.query)

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
      generateIcons(self, content, outputDir, query, function(err, iconResult) {
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

function generateIcons(loader, imageFileStream, outputDir, originalQuery, callback) {
  // Clone query to avoid hash changing, favicons will also manipulate query config
  const query = {
    ...originalQuery,
    config: { ...originalQuery.config, icons: { ...originalQuery.config.icons } },
  }
  const pathPrefix = query.outputFilePrefix.replace(/\/$/, '')

  if (!path.isAbsolute(outputDir)) {
    query.config.path = pathPrefix
  } else {
    query.config.path = pathPrefix + outputDir
  }

  favicons(imageFileStream, query.config, (err, response) => {
    if (err) return callback(err)

    // Filenames for cache file
    const fileNames = []

    response.images.forEach(image => {
      fileNames.push(pathPrefix + image.name)
      loader.emitFile(outputDir + image.name, image.contents)
    })

    response.files.forEach(file => {
      fileNames.push(pathPrefix + file.name)
      loader.emitFile(outputDir + file.name, file.contents)
    })

    let returnData = {
      outputFilePrefix: query.config.path,
      html: response.html,
      files: fileNames,
    }

    if (query.statsEncodeHtml) {
      let outputHtml = Array.isArray(response.html) ? response.html.join('\n') : response.html
      outputHtml = outputHtml.replace(/[\u00A0-\u9999<>\&]/gim, i => `&#${i.charCodeAt(0)};`) // eslint-disable-line
      outputHtml = outputHtml.replace(/"/g, '&quot;')
      outputHtml = outputHtml.replace(/\\"/g, '&quot;')

      returnData = {
        ...returnData,
        encodedHtml: outputHtml,
      }
    }

    callback(null, returnData)
  })
}

module.exports.raw = true

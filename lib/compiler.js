const path = require('path')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')

function getEntry(options, context) {
  return new SingleEntryPlugin(
    context,
    '!!' +
      require.resolve('./favicons.js') +
      '?' +
      JSON.stringify({
        outputFilePrefix: options.prefix,
        persistentCache: options.persistentCache,
        config: options.config,
      }) +
      '!' +
      options.logo,
  )
}

const compileProcessHandler = (compilation, chunks, callback) => {
  if (!chunks[0]) {
    return callback(compilation.errors[0] || 'Favicons and manifest generation failed')
  }
  var resultFile = chunks[0].files[0]
  var resultCode = compilation.assets[resultFile].source()
  var resultJson
  try {
    /* eslint no-eval:0 */
    var result = eval(resultCode)
    resultJson = JSON.stringify(result)
  } catch (e) {
    return callback(e)
  }
  compilation.assets[resultFile] = {
    source: function() {
      return resultJson
    },
    size: function() {
      return resultJson.length
    },
  }
  callback(null)
}

const compileProcess = (compilerName, compilation) => {
  if (compilation.cache) {
    if (!compilation.cache[compilerName]) {
      compilation.cache[compilerName] = {}
    }
    compilation.cache = compilation.cache[compilerName]
  }

  if (compilation.hooks) {
    compilation.hooks.optimizeChunkAssets.tapAsync(
      'AppManifestWebpackPluginOptimizeChunkAssets',
      (chunks, callback) => compileProcessHandler(compilation, chunks, callback),
    )
  } else {
    compilation.plugin('optimize-chunk-assets', (chunks, callback) =>
      compileProcessHandler(compilation, chunks, callback),
    )
  }
}

module.exports.compileTemplate = function compileTemplate(options, context, compilation) {
  // The entry file is just an empty helper as the dynamic template
  // require is added in "loader.js"
  const outputOptions = {
    filename: options.statsFilename,
    publicPath: compilation.outputOptions.publicPath,
  }
  // Create an additional child compiler which takes the template
  // and turns it into an Node.JS html factory.
  // This allows us to use loaders during the compilation
  const compilerName = getCompilerName(context, outputOptions.filename)
  const childCompiler = compilation.createChildCompiler(compilerName, outputOptions)
  childCompiler.context = context

  if (compilation.hooks) {
    getEntry(options, context).apply(childCompiler)
  } else {
    childCompiler.apply(getEntry(options, context))
  }

  // Fix for "Uncaught TypeError: __webpack_require__(...) is not a function"
  // Hot module replacement requires that every child compiler has its own
  // cache. @see https://github.com/ampedandwired/html-webpack-plugin/pull/179
  if (compilation.hooks) {
    childCompiler.hooks.compilation.tap('AppManifestWebpackPluginCompilation', compilation =>
      compileProcess(compilerName, compilation),
    )
  } else {
    childCompiler.plugin('compilation', compilation => compileProcess(compilerName, compilation))
  }

  // Compile and return a promise
  return new Promise(function(resolve, reject) {
    childCompiler.runAsChild(function(err, entries, childCompilation) {
      if (err) {
        return reject(err)
      }
      // Replace [hash] placeholders in filename
      // In webpack 4 the plugin interface changed, so check for available fns
      const outputName = compilation.mainTemplate.getAssetPath
        ? compilation.mainTemplate.hooks.assetPath.call(outputOptions.filename, {
            hash: childCompilation.hash,
            chunk: entries[0],
          })
        : compilation.mainTemplate.applyPluginsWaterfall('asset-path', outputOptions.filename, {
            hash: childCompilation.hash,
            chunk: entries[0],
          })
      // Resolve / reject the promise
      if (childCompilation && childCompilation.errors && childCompilation.errors.length) {
        const errorDetails = childCompilation.errors
          .map(function(error) {
            return error.message + (error.error ? ':\n' + error.error : '')
          })
          .join('\n')
        reject(new Error('Child compilation failed:\n' + errorDetails))
      } else if (err) {
        reject(err)
      } else {
        resolve({
          outputName: outputName,
          stats: JSON.parse(childCompilation.assets[outputName].source()),
        })
      }
    })
  })
}

/**
 * Returns the child compiler name e.g. 'html-webpack-plugin for "index.html"'
 */
function getCompilerName(context, filename) {
  const absolutePath = path.resolve(context, filename)
  const relativePath = path.relative(context, absolutePath)
  return (
    'app-manifest-webpack-plugin for "' +
    (absolutePath.length < relativePath.length ? absolutePath : relativePath) +
    '"'
  )
}

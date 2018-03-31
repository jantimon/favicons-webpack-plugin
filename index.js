const childCompiler = require('./lib/compiler.js')
const assert = require('assert')
const fs = require('fs')
const path = require('path')

function AppManifestWebpackPlugin(options) {
  if (typeof options === 'string') {
    options = { logo: options }
  }
  assert(typeof options === 'object', 'AppManifestWebpackPlugin options are required')
  assert(options.logo, 'An input file is required')
  this.options = {
    ...{
      prefix: 'icons-[hash]/',
      emitStats: false,
      statsFilename: 'iconstats-[hash].json',
      persistentCache: true,
      inject: true,
    },
    ...options,
  }

  this.options.config = {
    ...{
      appName: 'Webpack App', // Your application's name. `string`
      appDescription: null, // Your application's description. `string`
      developerName: null, // Your (or your developer's) name. `string`
      developerURL: null, // Your (or your developer's) URL. `string`
      display: 'standalone', // Android display: "browser" or "standalone". `string`
      start_url: '/', // Android start application's URL. `string`
      orientation: 'portrait',
      background: '#fff',
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: true,
        yandex: true,
        windows: true,
      },
    },
    ...this.options.config,
  }
}

AppManifestWebpackPlugin.prototype.apply = function(compiler) {
  if (!this.options.config.appName) {
    this.options.config.appName = guessAppName(compiler.context)
  }

  // Generate the favicons
  let compilationResult

  /**
   * Make handler
   * @param {object} compilation
   * @param {function} callback
   */
  const makeHandler = (compilation, callback) => {
    childCompiler
      .compileTemplate(this.options, compiler.context, compilation)
      .then(result => {
        compilationResult = result
        callback()
      })
      .catch(callback)
  }

  if (compiler.hooks) {
    compiler.hooks.make.tapAsync('AppManifestWebpackPluginMake', makeHandler)
  } else {
    compiler.plugin('make', makeHandler)
  }

  // Hook into the html-webpack-plugin processing
  // and add the html
  if (this.options.inject) {
    const addFaviconsToHtml = (htmlPluginData, callback) => {
      if (htmlPluginData.plugin.options.favicons !== false) {
        htmlPluginData.html = htmlPluginData.html.replace(
          /(<\/head>)/i,
          compilationResult.stats.html.join('') + '$&',
        )
      }
      callback(null, htmlPluginData)
    }

    // webpack 4
    if (compiler.hooks) {
      let tapped = 0

      compiler.hooks.compilation.tap('AppManifestWebpackPlugin', cmpp => {
        compiler.hooks.compilation.tap('HtmlWebpackPluginHooks', function() {
          if (!tapped++) {
            cmpp.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
              'app-manifest-webpack-plugin',
              addFaviconsToHtml,
            )
          }
        })
      })
    } else {
      compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-before-html-processing', addFaviconsToHtml)
      })
    }
  }

  /**
   * Emit handler
   *
   * @param {object} compilation
   * @param {function} callback
   */
  const emitHandler = (compilation, callback) => {
    delete compilation.assets[compilationResult.outputName]
    callback()
  }

  // Remove the stats from the output if they are not required
  if (!this.options.emitStats) {
    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync('AppManifestWebpackPluginEmit', emitHandler)
    } else {
      compiler.plugin('emit', emitHandler)
    }
  }
}

/**
 * Tries to guess the name from the package.json
 *
 * @param {string} compilerWorkingDirectory Path of work dir
 */
function guessAppName(compilerWorkingDirectory) {
  let packageJson = path.resolve(compilerWorkingDirectory, 'package.json')

  if (!fs.existsSync(packageJson)) {
    packageJson = path.resolve(compilerWorkingDirectory, '../package.json')
    if (!fs.existsSync(packageJson)) {
      return 'Webpack App'
    }
  }
  return JSON.parse(fs.readFileSync(packageJson)).name
}

module.exports = AppManifestWebpackPlugin

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
      emitStats: false,
      statsFilename: 'iconstats-[md5:hash:8].json',
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
      background: '#fff', // Background colour for flattened icons. `string`
      theme_color: '#fff', // Theme color for browser chrome. `string`
      path: '/', // Path for overriding default icons path. `string`
      display: 'standalone', // Android display: "browser" or "standalone". `string`
      orientation: 'portrait', // Android orientation: "portrait" or "landscape". `string`
      start_url: '/?homescreen=1', // Android start application's URL. `string`
      version: '1.0', // Your application's version number. `number`
      logging: false, // Print logs to console? `boolean`
      icons: {
        // Platform Options:
        // - offset - offset in percentage
        // - shadow - drop shadow for Android icons, available online only
        // - background:
        //   * false - use default
        //   * true - force use default, e.g. set background for Android icons
        //   * color - set background for the specified icons
        //
        android: true, // Create Android homescreen icon. `boolean` or `{ offset, background, shadow }`
        appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background }`
        appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background }`
        coast: { offset: 25 }, // Create Opera Coast icon with offset 25%. `boolean` or `{ offset, background }`
        favicons: true, // Create regular favicons. `boolean`
        firefox: true, // Create Firefox OS icons. `boolean` or `{ offset, background }`
        windows: true, // Create Windows 8 tile icons. `boolean` or `{ background }`
        yandex: true, // Create Yandex browser icon. `boolean` or `{ background }`
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
          compilationResult.stats.html.join('\n') + '$&',
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

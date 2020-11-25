const childCompiler = require('./lib/compiler.js')
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const DEFAULT_OPTIONS = {
  emitStats: false,
  prefix: '',
  output: '/',
  statsFilename: 'iconstats-[hash].json',
  persistentCache: true,
  inject: true,
  config: {
    appName: 'Webpack App',
    appDescription: null,
    developerName: null,
    developerURL: null,
    background: '#fff',
    theme_color: '#fff',
    path: '/',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/?homescreen=1',
    version: '1.0',
    logging: false,
    loadManifestWithCredentials: true,
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: true,
      coast: { offset: 25 },
      favicons: true,
      firefox: true,
      windows: true,
      yandex: true,
    },
  },
}

const PLUGIN_NAME = 'AppManifestWebpackPlugin'

const EVENTS = {
  MAKE: `${PLUGIN_NAME}Make`,
  COMPILE: `${PLUGIN_NAME}Compile`,
  EMIT: `${PLUGIN_NAME}Emit`,
  HTML_BEFORE: `${PLUGIN_NAME}HtmlPluginBefore`,
}

class AppManifestWebpackPlugin {
  constructor(options) {
    if (typeof options === 'string') {
      options = { logo: options }
    }

    assert(typeof options === 'object', 'app-manifest-webpack-plugin: options are required')
    assert(options.logo, 'An input file of icon is required')

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }
    this.compilationResult = null
  }

  /**
   * Tries to guess the name from the package.json
   *
   * @param {string} pwd Path of work dir
   */
  guessAppName(pwd) {
    let packageJson = path.resolve(pwd, 'package.json')

    if (!fs.existsSync(packageJson)) {
      packageJson = path.resolve(pwd, '../package.json')
      if (!fs.existsSync(packageJson)) {
        return 'Webpack App'
      }
    }
    return JSON.parse(fs.readFileSync(packageJson)).name
  }

  /**
   * Emit handler
   *
   * @param {object} compiler
   */
  emitHandler(compiler) {
    if (this.beforeV4) {
      compiler.plugin('emit', (compilation, cb) => this.emitProccess(compilation, cb))
    } else {
      compiler.hooks['emit'].tap(EVENTS.EMIT, (compilation, cb) =>
        this.emitProccess(compilation, cb),
      )
    }
  }

  emitProccess(compilation, cb) {
    delete compilation.assets[this.compilationResult.outputName]

    if (cb) cb(null)
  }

  pluginHandler(compilation) {
    compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, cb) => {
      this.htmlProccessingFn(htmlPluginData, cb)
    })
  }

  hooksHandler(compilation) {
    const beforeEmit =
      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing ||
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit
    if (!beforeEmit && this.options.inject) {
      const message = `compilation.hooks.htmlWebpackPluginAfterHtmlProcessing is lost.
       Please make sure you have installed html-webpack-plugin and put it before ${PLUGIN_NAME}`
      throw new Error(message)
    }

    beforeEmit.tapAsync(PLUGIN_NAME, (htmlPluginData, cb) =>
      this.htmlProccessingFn(htmlPluginData, cb),
    )
  }

  htmlProccessingFn(htmlPluginData, cb) {
    if (htmlPluginData.plugin.options.favicons !== false) {
      htmlPluginData.html = htmlPluginData.html.replace(
        /(<\/head>)/i,
        this.compilationResult.stats.html.join('\n') + '$&',
      )
    }
    cb(null, htmlPluginData)
  }

  /**
   * Compile handler
   * @param {object} compiler
   * @param {object} compilation
   * @param {function} cb
   */
  compileHandler(compiler, compilation, cb) {
    childCompiler
      .compileTemplate(this.options, compiler.context, compilation)
      .then(result => {
        this.compilationResult = result
        cb(null)
      })
      .catch(cb)
  }

  /**
   * Apply plugin
   *
   * @param {object} compiler
   */
  apply(compiler) {
    this.beforeV4 = !compiler.hooks

    if (!this.options.config.appName) {
      this.options.config.appName = this.guessAppName(compiler.context)
    }

    const compile = this.compileHandler.bind(this, compiler)

    if (this.beforeV4) {
      compiler.plugin('make', compile)
    } else {
      compiler.hooks['make'].tapAsync(EVENTS.MAKE, compile)
    }

    if (this.options.inject) {
      if (this.beforeV4) {
        compiler.plugin('compilation', this.pluginHandler.bind(this))
      } else {
        compiler.hooks['compilation'].tap(EVENTS.COMPILE, this.hooksHandler.bind(this))
      }
    }

    if (!this.options.emitStats) {
      this.emitHandler(compiler)
    }
  }
}

module.exports = AppManifestWebpackPlugin

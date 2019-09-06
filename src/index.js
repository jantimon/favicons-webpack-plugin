const assert = require('assert');
const child = require('./compiler');
const Oracle = require('./oracle');
const { tap, tapHtml, getAssetPath } = require('./compat');
const path = require('path');
const crypto = require('crypto');

const faviconCompilations = new WeakMap();

module.exports = class FaviconsWebpackPlugin {
  constructor(args) {
    const options = (typeof args === 'string') ? { logo: args } : args;

    this.options = Object.assign({
      cache: true,
      inject: true,
      favicons: {},
      prefix: 'assets/',
    }, options);
  }

  apply(compiler) {
    const oracle = new Oracle(compiler.context);

    {
      const {
        appName = oracle.guessAppName(),
        appDescription = oracle.guessDescription(),
        version = oracle.guessVersion(),
        developerName = oracle.guessDeveloperName(),
        developerURL = oracle.guessDeveloperURL(),
      } = this.options.favicons;

      Object.assign(this.options.favicons, {
        appName,
        appDescription,
        version,
        developerName,
        developerURL,
      });
    }

    if (this.options.logo === undefined) {
      const defaultLogo = path.resolve(compiler.context, 'logo.png');
      try {
        compiler.inputFileSystem.statSync(defaultLogo);
        this.options.logo = defaultLogo;
      } catch (e) {
      }
      assert(typeof this.options.logo === 'string', 'Could not find `logo.png` for the current webpack context');
    }

    if (typeof this.options.inject !== 'function') {
      const { inject } = this.options;
      this.options.inject = htmlPlugin =>
        inject === 'force'
        || htmlPlugin.options.favicons !== false && htmlPlugin.options.inject && inject;
    }

    // Hook into the webpack compilation
    // to start the favicon generation
    tap(compiler, 'make', 'FaviconsWebpackPlugin', (compilation, callback) => {
      let faviconCompilation;
      switch (this.getCurrentCompilationMode(compiler) ) {
        case 'light':
          faviconCompilation = this.generateFaviconsLight(compiler, compilation);
          break;
        case 'webapp':
        default:
          faviconCompilation = this.generateFaviconsWebapp(compiler, compilation);
      }
      
      // Hook into the html-webpack-plugin processing and add the html
      tapHtml(compilation, 'FaviconsWebpackPlugin', (htmlPluginData, htmlWebpackPluginCallback) => {
        faviconCompilation.then((tags) => {
          if (this.options.inject(htmlPluginData.plugin)) {
            const idx = (htmlPluginData.html + '</head>').search(/<\/head>/i);
            htmlPluginData.html = [htmlPluginData.html.slice(0, idx), ...tags, htmlPluginData.html.slice(idx)].join('');
          }
          htmlWebpackPluginCallback(null, htmlPluginData);
        }).catch(htmlWebpackPluginCallback);
      });

      // Save the promise and execute the callback immediately to not block 
      // the webpack build see the `afterCompile` FaviconsWebpackPlugin hook 
      // implementation where the promise is picked up again
      faviconCompilations.set(compilation, faviconCompilation);
      callback();
    });

    // Make sure that the build waits for the favicon generation to complete
    tap(compiler, 'afterCompile', 'FaviconsWebpackPlugin', (compilation, callback) => {
      const faviconCompilation = faviconCompilations.get(compilation) || Promise.resolve();
      faviconCompilations.delete(compilation);
      faviconCompilation.then(() => callback(), callback);
    });

  }

  /** 
   * The light mode will only add a favicon
   * this is very fast but also very limited
   * it is the default mode for development
   */
  generateFaviconsLight(compiler, compilation) {
    return new Promise((resolve, reject) => {
      const logoFileName = path.resolve(compilation.compiler.context, this.options.logo);
      const webpackPublicPath = compilation.outputOptions.publicPath || '/';
      const faviconExt = path.extname(this.options.logo);
      // Copy file to output directory
      compiler.inputFileSystem.readFile(logoFileName, (err, content) => {
        if (err) {
          return reject(err);
        }
        const hash = crypto.createHash('sha256').update(content.toString('utf8')).digest('hex');
        const outputPath = getAssetPath(compilation, this.options.prefix, {hash, chunk: {
          hash: hash,
          contentHash: hash
        }});
        const logoOutputPath = outputPath + (outputPath.substr(-1) === '/' ? '' : '/') + 'favicon' + faviconExt;  
        compilation.assets[logoOutputPath] = {
          source: () => content,
          size: () => content.length
        }
        resolve([
          `<link rel="icon" href="${webpackPublicPath}${logoOutputPath}">`
        ]);
      });
    });
  }

  /**
   *  The webapp mode will add a variety of icons
   * this is not as fast as the light mode but
   * supports all common browsers and devices
   */
  generateFaviconsWebapp(compiler, compilation) {
    // Generate favicons using the npm favicons library
    return child.run(this.options, compiler.context, compilation)
  }

  /** 
   * Returns wether the plugin should generate a light version or a full webapp
   */
  getCurrentCompilationMode(compiler) {
    // From https://github.com/webpack/webpack/blob/3366421f1784c449f415cda5930a8e445086f688/lib/WebpackOptionsDefaulter.js#L12-L14
    const isProductionLikeMode = compiler.options.mode === 'production' || !compiler.options.mode;
    // Read the current `mode` and `devMode` option
    const faviconDefaultMode = isProductionLikeMode ? 'webapp': 'light';
    const faviconMode = isProductionLikeMode ? (this.options.mode || faviconDefaultMode) : (this.options.devMode || this.options.mode || faviconDefaultMode);
    return faviconMode;
  }
}

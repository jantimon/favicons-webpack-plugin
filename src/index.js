// @ts-check

const assert = require('assert');
const parse5 = require('parse5');
const path = require('path');
const { runCached } = require('./cache');
const Oracle = require('./oracle');
const url = require('url');

/** @type {WeakMap<any, Promise<{tags: string[], assets: Array<{name: string, contents: import('webpack').sources.RawSource}>}>>} */
const faviconCompilations = new WeakMap();

class FaviconsWebpackPlugin {
  /**
   * @param {import('./options').FaviconWebpackPlugionOptions | string} args
   */
  constructor(args) {
    /* @type {import('./options').FaviconWebpackPlugionOptions} */
    const options = (typeof args === 'string') ? { logo: args } : args;
    /** @type {Partial<import('favicons').Configuration>} */
    const emptyFaviconsConfig = {};
    /** @type {import('./options').FaviconWebpackPlugionInternalOptions} */
    this.options = {
      cache: true,
      inject: true,
      favicons: emptyFaviconsConfig,
      prefix: 'assets/',
      ...options
    };
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.initialize.tap('FaviconsWebpackPlugin', () => {
      this.hookIntoCompiler(compiler);
    });
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  hookIntoCompiler(compiler) {
    const webpack = compiler.webpack;
    const Compilation = webpack.Compilation;
    const oracle = new Oracle(compiler.context);

    {
      const {
        appName = oracle.guessAppName(),
        appDescription = oracle.guessDescription(),
        version = oracle.guessVersion(),
        developerName = oracle.guessDeveloperName(),
        developerURL = oracle.guessDeveloperURL()
      } = this.options.favicons;

      Object.assign(this.options.favicons, {
        appName,
        appDescription,
        version,
        developerName,
        developerURL
      });
    }

    if (this.options.logo === undefined) {
      const defaultLogo = path.resolve(compiler.context, 'logo.png');
      try {
        compiler.inputFileSystem.statSync(defaultLogo);
        this.options.logo = defaultLogo;
      } catch (e) {}
      // @ts-ignore
      assert(
        typeof this.options.logo === 'string',
        'Could not find `logo.png` for the current webpack context'
      );
    }

    // Hook into the webpack compilation
    // to start the favicon generation
    compiler.hooks.make.tapPromise(
      'FaviconsWebpackPlugin',
      async compilation => {
        const faviconCompilation = runCached(
          this.options,
          compiler.context,
          compilation,
          this,
          this.generateFavicons.bind(this)
        );

        // Watch for changes to the logo
        compilation.fileDependencies.add(this.options.logo);

        // Hook into the html-webpack-plugin processing and add the html
        const HtmlWebpackPlugin = compiler.options.plugins
          .map(({ constructor }) => constructor)
          .find(
            /**
             * Find only HtmlWebpkackPlugin constructors
             * @type {(constructor: Function) => constructor is typeof import('html-webpack-plugin')}
             */
            constructor =>
              constructor && constructor.name === 'HtmlWebpackPlugin'
          );

        if (HtmlWebpackPlugin && this.options.inject) {
          if (!verifyHtmlWebpackPluginVersion(HtmlWebpackPlugin)) {
            compilation.errors.push(
              new compiler.webpack.WebpackError(
                `${'FaviconsWebpackPlugin - This FaviconsWebpackPlugin version is not compatible with your current HtmlWebpackPlugin version.\n' +
                  'Please upgrade to HtmlWebpackPlugin >= 5 OR downgrade to FaviconsWebpackPlugin 2.x\n'}${getHtmlWebpackPluginVersion()}`
              )
            );

            return;
          }
          HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
            'FaviconsWebpackPlugin',
            (htmlPluginData, htmlWebpackPluginCallback) => {
              // Skip if a custom injectFunction returns false or if
              // the htmlWebpackPlugin optuons includes a `favicons: false` flag
              const isInjectionAllowed =
                typeof this.options.inject === 'function'
                  ? this.options.inject(htmlPluginData.plugin)
                  : this.options.inject !== false &&
                    htmlPluginData.plugin.userOptions.favicon !== false &&
                    htmlPluginData.plugin.userOptions.favicons !== false;

              if (isInjectionAllowed === false) {
                return htmlWebpackPluginCallback(null, htmlPluginData);
              }

              faviconCompilation
                .then(faviconCompilation => {
                  // faviconCompilation.publicPath and htmlPluginData.publicPath can be:
                  // absolute:  http://somewhere.com/app1/
                  // absolute:  /demo/app1/
                  // relative:  my/app/
                  const publicPathFromHtml = url.resolve(
                    htmlPluginData.publicPath,
                    faviconCompilation.publicPath
                  );

                  // Prefix links to icons
                  const pathReplacer =
                    !this.options.favicons.path ||
                    this.getCurrentCompilationMode(compiler) === 'light'
                      ? /** @param {string} url */ url =>
                          typeof url === 'string'
                            ? publicPathFromHtml + url
                            : url
                      : /** @param {string} url */ url => url;

                  htmlPluginData.assetTags.meta.push(
                    ...faviconCompilation.tags
                      .map(tag => parse5.parseFragment(tag).childNodes[0])
                      .map(({ tagName, attrs }) => {
                        const htmlTag = {
                          tagName,
                          voidTag: true,
                          meta: { plugin: 'favicons-webpack-plugin' },
                          attributes: attrs.reduce(
                            (obj, { name, value }) =>
                              Object.assign(obj, { [name]: value }),
                            {}
                          )
                        };
                        // Prefix link tags
                        if (typeof htmlTag.attributes.href === 'string') {
                          htmlTag.attributes.href = pathReplacer(
                            htmlTag.attributes.href
                          );
                        }
                        // Prefix meta tags
                        if (
                          htmlTag.tagName === 'meta' &&
                          [
                            'msapplication-TileImage',
                            'msapplication-config'
                          ].includes(htmlTag.attributes.name)
                        ) {
                          htmlTag.attributes.content = pathReplacer(
                            htmlTag.attributes.content
                          );
                        }

                        return htmlTag;
                      })
                  );

                  htmlWebpackPluginCallback(null, htmlPluginData);
                })
                .catch(htmlWebpackPluginCallback);
            }
          );
        }

        // Save the promise and execute the callback immediately to not block
        // the webpack build see the `afterCompile` FaviconsWebpackPlugin hook
        // implementation where the promise is picked up again
        faviconCompilations.set(compilation, faviconCompilation);
      }
    );

    compiler.hooks.thisCompilation.tap('FaviconsWebpackPlugin', compilation => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'FaviconsWebpackPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        async () => {
          const faviconCompilation = faviconCompilations.get(compilation);
          if (!faviconCompilation) {
            return;
          }
          const faviconAssets = (await faviconCompilation).assets;
          faviconAssets.forEach(({ name, contents }) => {
            compilation.emitAsset(name, contents);
          });
        }
      );
    });

    // Make sure that the build waits for the favicon generation to complete
    compiler.hooks.afterCompile.tapPromise(
      'FaviconsWebpackPlugin',
      async compilation => {
        const faviconCompilation =
          faviconCompilations.get(compilation) || Promise.resolve();
        faviconCompilations.delete(compilation);
        await faviconCompilation;
      }
    );
  }

  /**
   * Generate the favicons
   *
   * @param {Buffer | string} logoSource
   * @param {import('webpack').Compilation} compilation
   * @param {string} resolvedPublicPath
   * @param {string} outputPath
   */
  generateFavicons(logoSource, compilation, resolvedPublicPath, outputPath) {
    switch (this.getCurrentCompilationMode(compilation.compiler)) {
      case 'light':
        if (!this.options.mode) {
          compilation.logger.info(
            'favicons-webpack-plugin - generate only a single favicon for fast compilation time in development mode. This behaviour can be changed by setting the favicon mode option.'
          );
        }

        return this.generateFaviconsLight(
          logoSource,
          compilation,
          resolvedPublicPath,
          outputPath
        );
      case 'webapp':
      default:
        return this.generateFaviconsWebapp(
          logoSource,
          compilation,
          resolvedPublicPath,
          outputPath
        );
    }
  }

  /**
   * The light mode will only add a favicon
   * this is very fast but also very limited
   * it is the default mode for development
   *
   * @param {Buffer | string} logoSource
   * @param {import('webpack').Compilation} compilation
   * @param {string} resolvedPublicPath
   * @param {string} outputPath
   */
  async generateFaviconsLight(
    logoSource,
    compilation,
    resolvedPublicPath,
    outputPath
  ) {
    const faviconExt = path.extname(this.options.logo);
    const faviconName = `favicon${faviconExt}`;
    const RawSource = compilation.compiler.webpack.sources.RawSource;

    return {
      publicPath: resolvedPublicPath,
      assets: [
        {
          name: path.join(outputPath, faviconName),
          contents: new RawSource(logoSource, false)
        }
      ],
      tags: [`<link rel="icon" href="${faviconName}">`]
    };
  }

  /**
   * The webapp mode will add a variety of icons
   * this is not as fast as the light mode but
   * supports all common browsers and devices
   *
   * @param {Buffer | string} logoSource
   * @param {import('webpack').Compilation} compilation
   * @param {string} resolvedPublicPath
   * @param {string} outputPath
   */
  async generateFaviconsWebapp(
    logoSource,
    compilation,
    resolvedPublicPath,
    outputPath
  ) {
    const RawSource = compilation.compiler.webpack.sources.RawSource;
    const favicons = loadFaviconsLibrary();
    // Generate favicons using the npm favicons library
    const { html: tags, images, files } = await favicons(logoSource, {
      // Generate all assets relative to the root directory
      // to allow relative manifests and to set the final public path
      // once it has been provided by the html-webpack-plugin
      path: '',
      ...this.options.favicons
    });
    const assets = [...images, ...files].map(({ name, contents }) => ({
      name: outputPath ? path.join(outputPath, name) : name,
      contents: new RawSource(contents, false)
    }));

    return { assets, tags, publicPath: resolvedPublicPath };
  }

  /**
   * Returns wether the plugin should generate a light version or a full webapp
   */
  getCurrentCompilationMode(compiler) {
    // From https://github.com/webpack/webpack/blob/3366421f1784c449f415cda5930a8e445086f688/lib/WebpackOptionsDefaulter.js#L12-L14
    const isProductionLikeMode =
      compiler.options.mode === 'production' || !compiler.options.mode;
    // Read the current `mode` and `devMode` option
    const faviconDefaultMode = isProductionLikeMode ? 'webapp' : 'light';

    return isProductionLikeMode
      ? this.options.mode || faviconDefaultMode
      : this.options.devMode || this.options.mode || faviconDefaultMode;
  }
}

/**
 * Verify that the html-webpack-plugin is compatible
 * @param {typeof import('html-webpack-plugin')} htmlWebpackPlugin
 */
function verifyHtmlWebpackPluginVersion(htmlWebpackPlugin) {
  // Verify that this HtmlWebpackPlugin supports hooks
  return htmlWebpackPlugin.version >= 5;
}

/** Return the currently used html-webpack-plugin location */
function getHtmlWebpackPluginVersion() {
  try {
    const location = require.resolve('html-webpack-plugin/package.json');
    const version = require(location).version;

    return `found html-webpack-plugin ${version} at ${location}`;
  } catch (e) {
    return 'html-webpack-plugin not found';
  }
}

/**
 * Try to load favicon for the full favicon generation
 *
 * As favicon turned from a direct dependency to a peerDependency a detailed error message is shown
 * to resolve the breaking change
 */
function loadFaviconsLibrary() {
  try {
    return require('favicons');
  } catch (e) {
    throw new Error(
      `Could not find the npm peerDependency "favicons".\nPlease run:\nnpm i favicons\n - or -\nyarn add favicons\n\n${String(
        e
      )}`
    );
  }
}

module.exports = FaviconsWebpackPlugin;

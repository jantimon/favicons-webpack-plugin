export interface FaviconWebpackPlugionOptions {
  /** our source logo - can be png or svg (required) */
  logo: string | string[],
  /** our maskable source logo - can be png or svg (optional) */
  logoMaskable?: string | string[],
  /** 
   * Enable caching
   *  Note: disabling caching may increase build times considerably
   */
  cache?: boolean, 
  /**
   * 
   * Inject html links/metadata (requires html-webpack-plugin).
   * This option accepts arguments of different types:
   * - boolean
   *   `false`: disables injection
   *   `true`: enables injection if that is not disabled in html-webpack-plugin
   * - function
   *   any predicate that takes an instance of html-webpack-plugin and returns either
   *   `true` or `false` to control the injection of html metadata for the html files
   *   generated by this instance.
   */
  inject?: boolean | ((htmlWebpackPlugin: any) => boolean), 
  /** 
   * Favicons configuration option 
   * @see https://github.com/itgalaxy/favicons
   */
  favicons?: Partial<import('favicons').FaviconOptions>,
  /**
   * Favicon generation modes
   * - `light`  
   *     the light mode is using the original logo as favicon
   *     this mode has a very fast compilation but limited features
   *     by default this mode is used for development
   * - `webapp`  
   *     the webapp mode is convertig the original logo into different favicons
   *     this mode has a quite slow compilation but wide browser support
   *     by default this mode is used for production
   */
  mode?: 'light' | 'webapp' | 'auto',
  /**
   * Favicon generation modes used during development  
   * - `light`  
   *     the light mode is using the original logo as favicon
   *     this mode has a very fast compilation but limited features
   *     by default this mode is used for development
   * - `webapp`  
   *     the webapp mode is convertig the original logo into different favicons
   *     this mode has a quite slow compilation but wide browser support
   *     by default this mode is used for production
   */
  devMode?: 'light' | 'webapp',
  /**
   * Web app manifests are part of a collection of web technologies called progressive web apps (PWAs), 
   * which are websites that can be installed to a device’s homescreen without an app store.
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
   * 
   * The manifest option allows to provide a filepath to a base manifest.json file or a base manifest configuration
   */
  manifest?: string | { [key: string]: any }
  /**
   * Prefix path for generated assets
   */
  prefix?: string, 
  /**
   * The directory to output the assets relative to the webpack output dir.
   * Relative string paths are allowed here ie '../public/static'. If this
   * option is not set, `prefix` is used.
   */
  outputPath?: string,
  /** Override the publicPath option usually read from webpack configuration */
  publicPath?: string,
}


export type FaviconWebpackPlugionInternalOptions = Required<Omit<FaviconWebpackPlugionOptions, 
  // Optional properties after applying defaults:
  | 'mode' 
  | 'devMode'
  | 'publicPath'
  | 'outputPath'
>> & FaviconWebpackPlugionOptions
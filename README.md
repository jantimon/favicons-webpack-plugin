App Manifest Webpack Plugin
========================================

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![travis][travis]][travis-url]
[![Maintainability](https://api.codeclimate.com/v1/badges/ea3844bff7db00d519de/maintainability)](https://codeclimate.com/github/romanlex/app-manifest-webpack-plugin/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ea3844bff7db00d519de/test_coverage)](https://codeclimate.com/github/romanlex/app-manifest-webpack-plugin/test_coverage)

[npm]: https://img.shields.io/npm/v/app-manifest-webpack-plugin.svg
[npm-url]: https://www.npmjs.com/package/app-manifest-webpack-plugin

[node]: https://img.shields.io/node/v/app-manifest-webpack-plugin.svg
[node-url]: https://nodejs.org

[travis]: https://travis-ci.org/gilbarbara/app-manifest-webpack-plugin.svg
[travis-url]: https://travis-ci.org/romanlex/app-manifest-webpack-plugin

[deps]: https://david-dm.org/romanlex/app-manifest-webpack-plugin.svg
[deps-url]: https://david-dm.org/romanlex/app-manifest-webpack-plugin

This is fork of [jantimon/favicons-webpack-plugin](https://github.com/jantimon/favicons-webpack-plugin) with improvements:

+ All tests is rewritten with support of webpack v4
+ All dependencies is updated
+ The plugin is rewritten in accordance with the principles of DRY
+ Added support of webpack v4
+ Added support of all params for config from `favicons` package

Allows to use the [favicons](https://github.com/haydenbleasel/favicons) generator with webpack.

This plugin also generates manifest files:

+ `manifest.json`
+ `browserconfig.xml`
+ `yandex-browser-manifest.json`

Screenshot with inject to HtmlWebpackPlugin
------------

![Screenshot](example/Screenshot_20180401_111647.png?raw=true "Screenshot")

Installation
------------

You must be running `webpack (version ^2.x)` on `node (version ^6.14.1)`

Install:

```bash
npm install --save-dev app-manifest-webpack-plugin
```

Install with yarn:

```bash
yarn add -D app-manifest-webpack-plugin
```

Basic Usage
-----------

Add the plugin to your webpack config as follows:

```javascript
const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin')

...

plugins: [
  new AppManifestWebpackPlugin({
    logo: 'my-logo.png',
    inject: false,
  })
]
```

This basic configuration will generate 37 different icons for iOS devices, Android devices and the Desktop browser out of your `my-logo.png` file.

It can optionally also generate a `iconstats.json` for you.

Usage with `html-webpack-plugin`
-----------

If you are using with [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) it will also inject the necessary html for you:

```html
  <link rel="apple-touch-icon" sizes="57x57" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-icon-72x72.png">
  ...
  ...
  <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-startup-image-1536x2008.png">
```

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  // Make sure that AppManifestWebpackPlugin below HtmlWebpackPlugin
  new AppManifestWebpackPlugin({
    logo: 'my-logo.png',
    statsFilename: 'iconstats.json',
    persistentCache: false,
    config: {
      path: '/static/assets/',
    },
  }),
]
```

All properties
-----------

```javascript
plugins: [
  new AppManifestWebpackPlugin({
    // Your source logo
    logo: 'my-logo.png',
    // Prefix for file names
    prefix: '/assets/icons-[hash:8]/', // default '/'
    // Output path for icons (icons will be saved to output.path(webpack config) + this key)
    output: '/icons-[hash:8]/', // default '/'. Can be absolute or relative
    // Emit all stats of the generated icons
    emitStats: false,
    // The name of the json containing all favicon information
    statsFilename: 'iconstats.json', // can be absolute path
    // Encode html entities in stats file (Example json_decode from php doesn't support html strings with escaped double quotes but it's valid json)
    statsEncodeHtml: false,
    // Generate a cache file with control hashes and
    // don't rebuild the favicons until those hashes change
    persistentCache: true,
    // Inject the html into the html-webpack-plugin. Default true
    inject: true,
    // favicons configuration object. Support all keys of favicons (see https://github.com/haydenbleasel/favicons)
    config: {
      loadManifestWithCredentials: true, // use crossOrigin="use-credentials" for link tag with manifest
      appName: 'Webpack App', // Your application's name. `string`
      appDescription: null, // Your application's description. `string`
      developerName: null, // Your (or your developer's) name. `string`
      developerURL: null, // Your (or your developer's) URL. `string`
      background: '#fff', // Background colour for flattened icons. `string`
      theme_color: '#fff', // Theme color for browser chrome. `string`
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
    }
  })
]
```

Prefix and output options
-----------
This options help you save output files or change paths to icons in your html as you want.
Example you want save output icons to `icons/` directory in your build path but in html you want set another prefix for files, example `/assets/webpack/icons/`
when you can use options for this

```javascript
  new AppManifestWebpackPlugin({
    // Your source logo
    logo: 'my-logo.png',
    // Prefix for file names (html will be container icons with this prefix)
    prefix: '/assets/webpack/',
    // Output path for icons (icons will be saved to output.path(webpack config) + this key)
    output: '/icons-[hash:8]/'
  })
```

html file will be contains current paths

```html
<link rel="apple-touch-icon" sizes="120x120" href="/assets/webpack/icons-4b62aad7/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/assets/webpack/icons-4b62aad7/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/assets/webpack/icons-4b62aad7/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/webpack/icons-4b62aad7/apple-touch-icon-180x180.png">
```

but files will be saved to `/icons-4b62aad7/` directory and you `iconstats.json` contains correct outputFilePrefix

```json
{ "outputFilePrefix":"/assets/webpack/icons-4b62aad7/" }
```

#### Keep in mind what `prefix` change filenames inside html, `output` it is the path where icons wiil be saved

#### Or another case. You want save icons above the directory of webpack `output`  and want set corrent path in the manifest files and html files

```javascript
  new AppManifestWebpackPlugin({
    // Your source logo
    logo: 'my-logo.png',
    // Output path can be relative. Icons will be saved to webpack output directory + output
    output: '../icons/',
    // Change prefix of files  for correct paths in your html and manifest files
    prefix: '/icons/'
  })
```

Stats file
-----------
When you use option `emitStats` the plugin is generated stats file with `statsFilename` and contains usefull data

```json
{
  "outputFilePrefix":"/",
  "html": [], // array of html strings
  "files": [], // array of generated icon names 
  "encodedHtml": "", // endoded html string if you use statsEncodeHtml option
}

```

# Changelog

Take a look at the  [CHANGELOG.md](https://github.com/romanlex/favicons-webpack-plugin/tree/master/CHANGELOG.md).


# Contribution

You're free to contribute to this project by submitting [issues](https://github.com/romanlex/favicons-webpack-plugin/issues) and/or [pull requests](https://github.com/romanlex/favicons-webpack-plugin/pulls). This project is test-driven, so keep in mind that every change and new feature should be covered by tests.
This project uses the [semistandard code style](https://github.com/Flet/semistandard).

# License

This project is licensed under [MIT](https://github.com/romanlex/favicons-webpack-plugin/blob/master/LICENSE).

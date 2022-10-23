Favicons Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/favicons-webpack-plugin.svg)](http://badge.fury.io/js/favicons-webpack-plugin) [![CI](https://github.com/jantimon/favicons-webpack-plugin/workflows/CI/badge.svg)](https://github.com/jantimon/favicons-webpack-plugin/actions?query=workflow%3ACI) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Leverages on [favicons](https://github.com/itgalaxy/favicons) to automatically generate your favicons for you.

## Installation

Install the plugin and [favicons](https://github.com/itgalaxy/favicons) with npm:
```shell
$ npm install --save-dev favicons favicons-webpack-plugin
```

## Zero Config Usage

Add your base logo as `logo.png` file to you webpack context folder.
(By default the context is the current working directory)

Add the plugin to your webpack config as follows:

```javascript
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

plugins: [
  new FaviconsWebpackPlugin()
]
```

## Basic Usage

[Demo](https://codesandbox.io/s/favicons-webpack-plugin-demo-uh195?file=/webpack.config.js)


Add the plugin to your webpack config as follows:

```javascript
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

...

plugins: [
  new FaviconsWebpackPlugin('/path/to/logo.png') // svg works too!
]
```

The default configuration will automatically generate webapp manifest files along with
[44 different icon formats](https://github.com/jantimon/favicons-webpack-plugin/tree/master/test/fixtures/expected/default)
as appropriate for iOS devices, Android devices, Windows Phone and various desktop browsers out of your single `logo.png`.

> **Tip:** You might want to [fine tune](#advanced-usage) what vendors to support.

### A Note on Path Resolution

Under the hood, Webpack resolves the path to logo according to the following
rules:

* If `/path/to/logo` is absolute, there is nothing to resolve and the path
specified is used as is.

* If `./path/to/logo` is relative, it's resolved with respect to Webpack's
[`context`](https://webpack.js.org/configuration/entry-context/#context),
which defaults to `process.cwd()`.

* If `path/to/logo` is neither explicitly relative nor absolute,
Webpack attempts to resolve it according to
[`resolve.modules`](https://webpack.js.org/configuration/resolve/#resolve-modules),
which defaults to `modules: ["node_modules"]`.

### HTML Injection

In combination with [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) it will also inject the necessary html for you:

```html
<link rel="apple-touch-icon" sizes="57x57" href="/assets/apple-touch-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="/assets/apple-touch-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="/assets/apple-touch-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="/assets/apple-touch-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-touch-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="167x167" href="/assets/apple-touch-icon-167x167.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon-180x180.png">
<link rel="apple-touch-icon" sizes="1024x1024" href="/assets/apple-touch-icon-1024x1024.png">
<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 1)" href="/assets/apple-touch-startup-image-320x460.png">
<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)" href="/assets/apple-touch-startup-image-640x920.png">
<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/assets/apple-touch-startup-image-640x1096.png">
<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/assets/apple-touch-startup-image-750x1294.png">
<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 3)" href="/assets/apple-touch-startup-image-1182x2208.png">
<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 3)" href="/assets/apple-touch-startup-image-1242x2148.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 1)" href="/assets/apple-touch-startup-image-748x1024.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)" href="/assets/apple-touch-startup-image-1496x2048.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 1)" href="/assets/apple-touch-startup-image-768x1004.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)" href="/assets/apple-touch-startup-image-1536x2008.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="228x228" href="/assets/coast-228x228.png">
<link rel="manifest" href="/assets/manifest.webmanifest">
<link rel="shortcut icon" href="/assets/favicon.ico">
<link rel="yandex-tableau-widget" href="/assets/yandex-browser-manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title">
<meta name="application-name">
<meta name="mobile-web-app-capable" content="yes">
<meta name="msapplication-TileColor" content="#fff">
<meta name="msapplication-TileImage" content="/assets/mstile-144x144.png">
<meta name="msapplication-config" content="/assets/browserconfig.xml">
<meta name="theme-color" content="#fff">
```

> https://github.com/jantimon/favicons-webpack-plugin/blob/master/test/fixtures/expected/html

## Advanced Usage

```javascript
plugins: [
  new FaviconsWebpackPlugin({
    // Your source logo (required)
    logo: './src/logo.png',
    // Your maskable source logo (optional)
    logoMaskable: './src/logo-maskable.png',
    // Allow caching the assets across webpack builds. By default this will use
    // webpack's cache configuration, but can be set to false to disable caching.
    // Note: disabling caching may increase build times considerably.
    // For more information, see: https://webpack.js.org/configuration/cache/
    cache: true,
    // Override the publicPath option usually read from webpack configuration
    publicPath: '/static',
    // The directory to output the assets relative to the webpack output dir.
    // Relative string paths are allowed here ie '../public/static'. If this
    // option is not set, `prefix` is used.
    outputPath: '/public/static',
    // Prefix path for generated assets
    prefix: 'assets/',
    // Inject html links/metadata (requires html-webpack-plugin).
    // This option accepts arguments of different types:
    //  * boolean
    //    `false`: disables injection
    //    `true`: enables injection if that is not disabled in html-webpack-plugin
    //  * function
    //    any predicate that takes an instance of html-webpack-plugin and returns either
    //    `true` or `false` to control the injection of html metadata for the html files
    //    generated by this instance.
    inject: true,

    // Favicons configuration options (see below)
    favicons: {
      ...
    }
  })
]
```

To fine tune what icons/metadata is generated, refer to
[favicons' documentation](https://github.com/itgalaxy/favicons#usage).

The options specified under `favicons:` are handed over as is to [favicons],
except that if `appName`, `appDescription`, `version`, `developerName` or
`developerURL` are left `undefined`, they will be automatically inferred
respectively from `name`, `description`, `version`, `author.name` and
`author.url` as defined in the nearest `package.json` if available.
To disable automatically retrieving metadata from `package.json`, simply set
to `null` the properties you want to omit.

### Examples

#### Basic

```javascript
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

plugins: [
  new FaviconsWebpackPlugin({
    logo: './src/logo.png', // svg works too!
    mode: 'webapp', // optional can be 'webapp', 'light' or 'auto' - 'auto' by default
    devMode: 'webapp', // optional can be 'webapp' or 'light' - 'light' by default 
    favicons: {
      appName: 'my-app',
      appDescription: 'My awesome App',
      developerName: 'Me',
      developerURL: null, // prevent retrieving from the nearest package.json
      background: '#ddd',
      theme_color: '#333',
      icons: {
        coast: false,
        yandex: false
      }
    }
  })
]
```

To fine tune what icons/metadata is generated, refer to
[favicons' documentation](https://github.com/itgalaxy/favicons#usage).

#### Handling Multiple HTML Files

```javascript
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { basename } = require('path')

...

plugins: [
    new HtmlWebpackPlugin({
        template: 'a.html.tmpl',
        filename: 'a.html',
    }),
    new HtmlWebpackPlugin({
        template: 'b.html.tmpl',
        filename: 'b.html',
    }),
    new FaviconsWebpackPlugin({
        logo: 'logo.svg',
        inject: htmlPlugin => 
          basename(htmlPlugin.options.filename) === 'a.html',
    }),
],
```

### Compilation Modes

Modes allow you to choose a very fast simplified favicon compilation or a production ready favicon compilation

By default or if the favicons mode option is set to `auto` the favicon compilation depends on the webpack mode:  
If the webpack mode is set to `development` the favicons mode will use a quick `light` favicons build.  
If the webpack mode is set to `production` the favicons mode will use a full `webapp` favicons build.

This behaviour can be adjusted by setting the favicons `mode` and `devMode` options.

### Custom manifests

The manifest options allows to overwrite values of the generated manifest.webmanifest with own values

```javascript
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

plugins: [
  new FaviconsWebpackPlugin({
    logo: './src/logo.png',
    mode: 'webapp',
    manifest: './src/manifest.webmanifest'
  })
]
```

## Compatibility

favicons-webpack-plugin 2.x is compatible with html-webpack-plugin 3.x  
favicons-webpack-plugin 3.x - 4.x is compatible with html-webpack-plugin 4.x  
favicons-webpack-plugin 5.x - 6.x is compatible with html-webpack-plugin 5.x

## Changelog

Take a look at the [CHANGELOG.md](https://github.com/jantimon/favicons-webpack-plugin/tree/master/CHANGELOG.md).

## Contribution

You're free to contribute to this project by submitting [issues](https://github.com/jantimon/favicons-webpack-plugin/issues) and/or [pull requests](https://github.com/jantimon/favicons-webpack-plugin/pulls).

Please keep in mind that every change and new feature should be covered by
tests.

## License

This project is licensed under [MIT](https://github.com/jantimon/favicons-webpack-plugin/blob/master/LICENSE).

[favicons]: https://github.com/itgalaxy/favicons

Favicons Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/favicons-webpack-plugin.svg)](http://badge.fury.io/js/favicons-webpack-plugin) [![Dependency Status](https://david-dm.org/jantimon/favicons-webpack-plugin.svg)](https://david-dm.org/jantimon/favicons-webpack-plugin) [![Build status](https://travis-ci.org/jantimon/favicons-webpack-plugin.svg)](https://travis-ci.org/jantimon/favicons-webpack-plugin) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Leverages on [favicons](https://github.com/haydenbleasel/favicons) to automatically generate your progressive web app for you.

## Installation

Install the plugin with npm:
```shell
$ npm install --save-dev favicons-webpack-plugin
```

## Basic Usage

Add the plugin to your webpack config as follows:

```javascript
let FaviconsWebpackPlugin = require('favicons-webpack-plugin')

...

plugins: [
  new FaviconsWebpackPlugin('my-logo.png') // svg works too!
]
```

The default configuration will automatically generate webapp manifest files along with
[44 different icon formats](https://github.com/jantimon/favicons-webpack-plugin/tree/master/test/fixtures/expected/default/assets)
as appropriate for iOS devices, Android devices, Windows Phone and various desktop browsers out of your single `my-logo.png`.

### Pro Tip

In combination with [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) it will also inject the necessary html for you:

> **Note**: `html-webpack-plugin` _must_ come before `webapp-webpack-plugin` in the plugins array.

```html
<link rel="apple-touch-icon" sizes="57x57" href="assets/apple-touch-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="assets/apple-touch-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="assets/apple-touch-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="assets/apple-touch-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="assets/apple-touch-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="assets/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="assets/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="assets/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon-180x180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="favicons-webpack-plugin">
<link rel="manifest" href="icons-366a3768de05f9e78c392fa62b8fbb80/manifest.json">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#fff">
<meta name="application-name" content="webapp-webpack-plugin">
<link rel="icon" type="image/png" sizes="228x228" href="assets/coast-228x228.png">
<link rel="yandex-tableau-widget" href="assets/yandex-browser-manifest.json">
<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 1)" href="assets/apple-touch-startup-image-320x460.png">
<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)" href="assets/apple-touch-startup-image-640x920.png">
<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="assets/apple-touch-startup-image-640x1096.png">
<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="assets/apple-touch-startup-image-750x1294.png">
<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 3)" href="assets/apple-touch-startup-image-1182x2208.png">
<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 3)" href="assets/apple-touch-startup-image-1242x2148.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 1)" href="assets/apple-touch-startup-image-748x1024.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 1)" href="assets/apple-touch-startup-image-768x1004.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)" href="assets/apple-touch-startup-image-1496x2048.png">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)" href="assets/apple-touch-startup-image-1536x2008.png">
<meta name="msapplication-TileColor" content="#fff">
<meta name="msapplication-TileImage" content="mstile-144x144.png">
<meta name="msapplication-config" content="browserconfig.xml">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
<link rel="shortcut icon" href="assets/favicon.ico">
```

> https://github.com/brunocodutra/webapp-webpack-plugin/blob/master/test/fixtures/expected/generate-html/index.html

## Advanced Usage

```javascript
plugins: [
  new FaviconsWebpackPlugin({
    // Your source logo
    logo: 'my-logo.png',
    // The prefix for all image files (might be a folder or a name)
    prefix: 'icons-[hash]/',
    // Inject the html into the html-webpack-plugin
    inject: true,

    // Favicons configuration options (see https://github.com/haydenbleasel/favicons#usage)
    favicons: {
      ...
    }
  })
]
```

For example:

```javascript
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

plugins: [
  new FaviconsWebpackPlugin({
    logo: 'my-logo.png', // svg works too!
    favicons {
      appName: 'my-app',
      background: '#ddd',
      theme_color: '#333'
    }
  })
]
```

To fine tune what icons/metadata is generated, refer to
[favicons' documentation](https://github.com/haydenbleasel/favicons#usage).

# Changelog

Take a look at the [CHANGELOG.md](https://github.com/jantimon/favicons-webpack-plugin/tree/master/CHANGELOG.md).

# Contribution

You're free to contribute to this project by submitting [issues](https://github.com/jantimon/favicons-webpack-plugin/issues) and/or [pull requests](https://github.com/jantimon/favicons-webpack-plugin/pulls). This project is test-driven, so keep in mind that every change and new feature should be covered by tests.

Please keep in mind that every change and new feature should be covered by tests.

## License

This project is licensed under [MIT](https://github.com/jantimon/favicons-webpack-plugin/blob/master/LICENSE).

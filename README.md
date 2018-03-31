App Manifest Webpack Plugin (Fork of favicons-webpack-plugin)
========================================

[![NPM version](https://badge.fury.io/js/app-manifest-webpack-plugin.svg)](https://www.npmjs.com/package/app-manifest-webpack-plugin)
[![build status](https://travis-ci.org/gilbarbara/app-manifest-webpack-plugin.svg)](https://travis-ci.org/romanlex/app-manifest-webpack-plugin)
[![Maintainability](https://api.codeclimate.com/v1/badges/ea3844bff7db00d519de/maintainability)](https://codeclimate.com/github/romanlex/app-manifest-webpack-plugin/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ea3844bff7db00d519de/test_coverage)](https://codeclimate.com/github/romanlex/app-manifest-webpack-plugin/test_coverage)

Allows to use the [favicons](https://github.com/haydenbleasel/favicons) generator with webpack
Forked [jantimon/favicons-webpack-plugin](https://github.com/jantimon/favicons-webpack-plugin)

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
  })
]
```

This basic configuration will generate 37 different icons for iOS devices, Android devices and the Desktop browser out of your `my-logo.png` file.

It can optionally also generate a [JSON file with all information about the icons](https://github.com/jantimon/favicons-webpack-plugin/blob/master/test/fixtures/expected/generate-html/iconstats.json) for you.

If you are using with [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) it will also inject the necessary html for you:

```html
  <link rel="apple-touch-icon" sizes="57x57" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-icon-72x72.png">
  ...
  ...
  <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)" href="icons-366a3768de05f9e78c392fa62b8fbb80/apple-touch-startup-image-1536x2008.png">
```

Advanced Usage
-----------

```javascript
plugins: [
  new AppManifestWebpackPlugin({
    // Your source logo
    logo: 'my-logo.png',
    // Emit all stats of the generated icons
    emitStats: false,
    // The name of the json containing all favicon information
    statsFilename: 'iconstats-[hash].json',
    // Generate a cache file with control hashes and
    // don't rebuild the favicons until those hashes change
    persistentCache: true,
    // Inject the html into the html-webpack-plugin
    inject: true,
    // favicons configuration object. Support all keys of favicons (see https://github.com/haydenbleasel/favicons)
    config: {
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
    }
  })
]
```

# Changelog

Take a look at the  [CHANGELOG.md](https://github.com/romanlex/favicons-webpack-plugin/tree/master/CHANGELOG.md).


# Contribution

You're free to contribute to this project by submitting [issues](https://github.com/romanlex/favicons-webpack-plugin/issues) and/or [pull requests](https://github.com/romanlex/favicons-webpack-plugin/pulls). This project is test-driven, so keep in mind that every change and new feature should be covered by tests.
This project uses the [semistandard code style](https://github.com/Flet/semistandard).

# License

This project is licensed under [MIT](https://github.com/romanlex/favicons-webpack-plugin/blob/master/LICENSE).

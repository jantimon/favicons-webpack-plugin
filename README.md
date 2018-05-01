Favicons Webpack Plugin
========================================

Allows to use the [favicons](https://github.com/haydenbleasel/favicons) generator with webpack

Installation
------------
You must be running webpack on node 0.12.x or higher

Install the plugin with npm:
```shell
$ npm install --D favicons-webpack-plugin@git+https://github.com/donskov/favicons-webpack-plugin.git
```

Basic Usage
-----------
Add the plugin to your webpack config as follows:

```javascript
let FaviconsWebpackPlugin = require('favicons-webpack-plugin')

...

plugins: [
  new FaviconsWebpackPlugin('my-logo.png')
]
```

This basic configuration will generate [37 different icons](https://github.com/donskov/favicons-webpack-plugin/tree/master/test/fixtures/expected/default/icons-366a3768de05f9e78c392fa62b8fbb80) for iOS devices, Android devices and the Desktop browser out of your `my-logo.png` file.
It can optionally also generate a [JSON file with all information about the icons](https://github.com/donskov/favicons-webpack-plugin/blob/master/test/fixtures/expected/generate-html/iconstats.json) for you.

If you are using with [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) it will also inject the necessary html for you:

https://github.com/donskov/favicons-webpack-plugin/blob/master/test/fixtures/expected/default-with-html/index.html

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
  new FaviconsWebpackPlugin({
    // Your source logo
    logo: 'my-logo.png',
    // The prefix for all image files (might be a folder or a name)
    outputFilePrefix: 'icons-[hash]/',
    // Emit all stats of the generated icons
    emitStats: false,
    // The name of the json containing all favicon information
    statsFilename: 'iconstats-[hash].json',
    // Generate a cache file with control hashes and
    // don't rebuild the favicons until those hashes change
    persistentCache: true,
    // Inject the html into the html-webpack-plugin
    inject: true,
    // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
    background: '#fff',
    // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
    appName: 'Webpack App',

    // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: true,
      coast: false,
      favicons: true,
      firefox: true,
      opengraph: false,
      twitter: false,
      yandex: false,
      windows: false
    }
  })
]
```

# Changelog

Take a look at the  [CHANGELOG.md](https://github.com/donskov/favicons-webpack-plugin/tree/master/CHANGELOG.md).


# Contribution

You're free to contribute to this project by submitting [issues](https://github.com/donskov/favicons-webpack-plugin/issues) and/or [pull requests](https://github.com/donskov/favicons-webpack-plugin/pulls). This project is test-driven, so keep in mind that every change and new feature should be covered by tests.
This project uses the [semistandard code style](https://github.com/Flet/semistandard).

# License

This project is licensed under [MIT](https://github.com/donskov/favicons-webpack-plugin/master/LICENSE).

Favicons Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/favicons-webpack-plugin.svg)](http://badge.fury.io/js/favicons-webpack-plugin) [![Dependency Status](https://david-dm.org/jantimon/favicons-webpack-plugin.svg)](https://david-dm.org/jantimon/favicons-webpack-plugin) [![Build status](https://travis-ci.org/jantimon/favicons-webpack-plugin.svg)](https://travis-ci.org/jantimon/favicons-webpack-plugin) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Allows to use the [favicons](https://github.com/haydenbleasel/favicons) generator with webpack

Installation
------------
You must be running webpack on node 0.12.x or higher

Install the plugin with npm:
```shell
$ npm install --save-dev favicons-webpack-plugin
```

Basic Usage
-----------
Add the plugin to your webpack config as follows:

```javascript
plugins: [
  new FaviconsWebpackPlugin('my-logo.png')
]  
```

Advanced Usage
-----------

```javascript
plugins: [
  new FaviconsWebpackPlugin({
    logo: 'my-logo.png',                // Your source logo
    prefix: 'icons-[hash]/',            // The prefix for all image files (might be a folder or a name)
    filename: 'iconstats-[hash].json',  // The name of the json containing all favicon information
    inject: true,                       // Inject the html into the html-webpack-plugin
    background: '#fff',                 // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
    title: 'Webpack App',               // favicon app title (see https://github.com/haydenbleasel/favicons#usage)

    // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
    icons: {
      andriod: true,
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

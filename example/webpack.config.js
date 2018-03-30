'use strict';
var AppManifestWebpackPlugin = require('..');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: './src/entry.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new AppManifestWebpackPlugin('./src/logo.png'),
    new HtmlWebpackPlugin()
  ]
};

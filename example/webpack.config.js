'use strict';
var FaviconsWebpackPlugin = require('..');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: './src/entry.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  plugins: [
    new FaviconsWebpackPlugin('./src/logo.png'),
    new HtmlWebpackPlugin()
  ]
};

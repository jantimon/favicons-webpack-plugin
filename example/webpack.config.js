const FaviconsWebpackPlugin = require('..');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: 'entry.js',
  resolve: {
    modules: [path.resolve(__dirname, 'src')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new FaviconsWebpackPlugin('logo.svg'),
    new HtmlWebpackPlugin()
  ]
};

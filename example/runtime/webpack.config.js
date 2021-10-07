const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../../src/');

const webpack = require('webpack');

module.exports = (env, args) => {
  return {
    mode: 'development',
    devtool: false,
    context: __dirname,
    entry: './src/app.js',
    output: {
      path: resolve(__dirname, 'public'),
      filename: 'app.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
      }),
      new FaviconsWebpackPlugin('./src/favicon.png'),
    ],
    stats: "errors-only"
  };
}

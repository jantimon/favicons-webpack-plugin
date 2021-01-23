const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../../src/');

const webpack = require('webpack');

module.exports = (env, args) => {
  return {
    context: __dirname,
    entry: './src/app.js',
    output: {
      path: resolve(__dirname, 'public'),
      filename: 'app.js',
    },
    cache: {
      type: 'filesystem',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
      }),
      new FaviconsWebpackPlugin({
        logo: './src/favicon.png',
        manifest: './src/manifest.json',
        mode: 'webapp'

      }),
    ],
    stats: "errors-only"
  };
}

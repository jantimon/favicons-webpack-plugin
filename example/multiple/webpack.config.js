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
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
      }),
      new FaviconsWebpackPlugin({
        logo: './src/favicon.png',
        favicons: {
          icons: {
            favicons: true,
            android: false,
            appleIcon: false,
            appleStartup: false,
            windows: false,
            yandex: false,
          },
        }
      }),
      new FaviconsWebpackPlugin({
        logo: './src/favicon.svg',
        prefix: 'assets2/',
        outputPath: 'assets2/',
        favicons: {
          icons: {
            favicons: false,
            android: false,
            appleIcon: true,
            appleStartup: false,
            windows: false,
            yandex: false,
          },
        }
      }),
    ],
    stats: "errors-only"
  };
}

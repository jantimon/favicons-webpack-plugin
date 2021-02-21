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
      new FaviconsWebpackPlugin({
        logo: './src/favicon.png',
        manifest: {
          "name": "Runtime Loader Example",
        },
        prefix: 'favicons/[contenthash]/' ,
        inject: false
      }),
    ],
    stats: "errors-only"
  };
}

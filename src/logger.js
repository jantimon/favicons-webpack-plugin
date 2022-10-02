// @ts-check

// Import types
/** @typedef {import("webpack").Compilation} WebpackCompilation */

/**
 * Returns the favicon webpack logger instance
 * @see https://webpack.js.org/api/logging/
 *
 * @param {WebpackCompilation} compilation
 */
const webpackLogger = (compilation) =>
  compilation.getLogger('favicons-webpack-plugin');

module.exports = { webpackLogger };

// @ts-check

// Import types
/** @typedef {ReturnType<import("webpack").Compiler['getCache']>} WebpackCacheFacade */
/** @typedef {import("webpack").Compilation} WebpackCompilation */
/** @typedef {Parameters<WebpackCompilation['fileSystemInfo']['checkSnapshotValid']>[0]} Snapshot */

/**
 * Returns the favicon webpack logger instance
 * @see https://webpack.js.org/api/logging/
 *
 * @param {WebpackCompilation} compilation
 */
const webpackLogger = compilation =>
  compilation.getLogger('favicons-webpack-plugin');

module.exports = { webpackLogger };

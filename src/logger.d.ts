declare const _exports: {
  webpackLogger: typeof webpackLogger;
};
export = _exports;
export type WebpackCompilation = import('webpack').Compilation;
export type WebpackLogger = ReturnType<WebpackCompilation['getLogger']>;
/** @typedef {import("webpack").Compilation} WebpackCompilation */
/** @typedef {ReturnType<WebpackCompilation['getLogger']>} WebpackLogger */
/**
 * Returns the favicon webpack logger instance
 * @see https://webpack.js.org/api/logging/
 *
 * @param {WebpackCompilation} compilation
 * @returns {WebpackLogger}
 */
declare const webpackLogger: (compilation: WebpackCompilation) => WebpackLogger;

declare const _exports: {
  getContentHash: typeof getContentHash;
  resolvePublicPath: typeof resolvePublicPath;
  replaceContentHash: typeof replaceContentHash;
};
export = _exports;
export type WebpackCompilation = import('webpack').Compilation;
/**
 * Replaces [contenthash] and [fullhash] inside the given publicPath and assetPath
 *
 * @param {WebpackCompilation} compilation
 * @param {undefined | string | ((...args:any[]) => string)} publicPath
 * @param {string} assetPath
 */
declare function resolvePublicPath(
  compilation: WebpackCompilation,
  publicPath: undefined | string | ((...args: any[]) => string),
  assetPath: string,
): string;
/**
 * Replaces [contenthash] and [fullhash] inside the given publicPath and assetPath
 *
 * @param {WebpackCompilation} compilation
 * @param {string} assetPath
 * @param {string} hash
 */
declare function replaceContentHash(
  compilation: WebpackCompilation,
  assetPath: string,
  hash: string,
): string;
/**
 * Returns the content hash for the given file content
 * @param {...(Buffer | string | undefined)} files
 */
declare function getContentHash(
  ...files: (Buffer | string | undefined)[]
): string;

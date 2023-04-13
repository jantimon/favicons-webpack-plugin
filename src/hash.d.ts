export type WebpackCompilation = import("webpack").Compilation;
/**
 * Returns the content hash for the given file content
 * @param {...(Buffer | string | undefined)} files
 */
export function getContentHash(...files: (Buffer | string | undefined)[]): string;
/**
 * Replaces [contenthash] and [fullhash] inside the given publicPath and assetPath
 *
 * @param {WebpackCompilation} compilation
 * @param {undefined | string | ((...args:any[]) => string)} publicPath
 * @param {string} assetPath
 */
export function resolvePublicPath(compilation: WebpackCompilation, publicPath: string | ((...args: any[]) => string) | undefined, assetPath: string): string;
/**
 * Replaces [contenthash] and [fullhash] inside the given publicPath and assetPath
 *
 * @param {WebpackCompilation} compilation
 * @param {string} assetPath
 * @param {string} hash
 */
export function replaceContentHash(compilation: WebpackCompilation, assetPath: string, hash: string): string;

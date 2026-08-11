declare const _exports: {
  resolveUrl: typeof resolveUrl;
};
export = _exports;
/**
 * Resolve a relative URL/path against a base.
 *
 * @param {string | undefined} base
 * @param {string | undefined} relative
 * @returns {string}
 */
declare function resolveUrl(
  base: string | undefined,
  relative: string | undefined,
): string;

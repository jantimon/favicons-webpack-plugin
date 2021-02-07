/// @ts-check
const htmlTagObjectToString = require('./html-tags').htmlTagObjectToString;

/**
 * The contextMap is a bridge which receives data from the 
 * favicons-webpack-plugin during the NormalModule loader phase 
 * see ./index.js
 * 
 * @type {
    WeakMap<any, Set<Promise<{
      publicPath: string;
      assets: {
          name: string;
          contents: import('webpack').sources.RawSource;
      }[];
      tags: Array<import('./html-tags').HtmlTagObject>;
    }>>>
  }
 */
const contextMap = new WeakMap();

/**
 * Config used for the webpack config
 */
const moduleRuleConfig = Object.freeze({
  test: require.resolve('../runtime/tags.js'),
  use: 'favicons-webpack-plugin/src/runtime-loader'
});

/**
 * the main loader is only a placeholder which will have no effect
 * as the pitch function returns
 *
 * @this {{ async: () => ((err: Error | null, result: string) => void)}}
 */
const loader = async function faviconsTagLoader() {
  const faviconCompilationPromisses = contextMap.get(this);
  if (!faviconCompilationPromisses) {
    throw new Error('broken contextMap');
  }

  const faviconCompilations = await Promise.all(faviconCompilationPromisses);

  const tagsOfFaviconCompilations = faviconCompilations.map(
    faviconCompilation => {
      const { tags, publicPath } = faviconCompilation;
      // Inject public path into tags tags into strings
      const tagsWithPublicPath = tags.map(tag => {
        if (!tag.attributes.href) {
          return tag;
        }
        return {
          ...tag,
          attributes: {
            ...tag.attributes,
            href: publicPath + tag.attributes.href
          }
        };
      });
      // Convert tags to string
      const htmlTags = tagsWithPublicPath.map(tag =>
        htmlTagObjectToString(tag, false)
      );
      return /** @type {[string, string[]]} */ ([publicPath, htmlTags]);
    }
  );

  // naive Object.fromEntries implementation as Object.entries requires node 12
  const tagsByPublicPath = tagsOfFaviconCompilations.reduce(
    (result, [key, value]) => {
      result[key] = value;
      return result;
    },
    {}
  );

  return `export default ${JSON.stringify(tagsByPublicPath)}`;
};

module.exports = Object.assign(loader, {
  // Use the loader as pitch loader to overrule all other loaders
  pitch: loader,
  contextMap,
  moduleRuleConfig
});

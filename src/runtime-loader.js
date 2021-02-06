/// @ts-check

/**
 * The contextMap is a bridge which receives data from the 
 * favicons-webpack-plugin during the NormalModule loader phase 
 * see ./index.js
 * 
 * @type {
    WeakMap<any, Promise<{
      publicPath: string;
      assets: {
          name: string;
          contents: import('webpack').sources.RawSource;
      }[];
      tags: string[];
    }>>
  }
 */
const contextMap = new WeakMap();

/**
 * Config used for the webpack config
 */
const moduleRuleConfig = Object.freeze({
    test: require.resolve('../runtime/tags.js'),
    use: 'favicons-webpack-plugin/src/runtime-loader', 
});

/** 
 * the main loader is only a placeholder which will have no effect
 * as the pitch function returns 
 * 
 * @this {{ async: () => ((err: Error | null, result: string) => void)}}
 */
const loader = function () {
  const callback = this.async();
  const faviconCompilation = contextMap.get(this);
  if (!faviconCompilation) {
    throw new Error('broken contextMap');
  }
  
  faviconCompilation.then(({tags}) => {
    callback(null, `export default ${JSON.stringify(tags)}`);
  });
}

module.exports = Object.assign(loader, {
  // Use the loader as pitch loader to overrule all other loaders
  pitch: loader,
  contextMap,
  moduleRuleConfig
});
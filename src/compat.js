const camelCase = require('camelcase');

/* istanbul ignore next */
module.exports.getAssetPath = ({ mainTemplate }, name, args) => (
  mainTemplate.getAssetPath /* Webpack >= 4.0 */
    ? mainTemplate.getAssetPath(name, args)
    : mainTemplate.applyPluginsWaterfall('asset-path', name, args)
);

/* istanbul ignore next */
module.exports.tap = (tappable, hook, name, plugin) => (
  tappable.hooks /* Webpack >= 4.0 */
    ? tappable.hooks[camelCase(hook)] && tappable.hooks[camelCase(hook)].tapAsync(name, plugin)
    : tappable.plugin(hook, plugin)
);

/* istanbul ignore next */
module.exports.tapHtml = (tappable, name, plugin) => {
  try {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    return HtmlWebpackPlugin.getHooks /* HtmlWebpackPlugin >= 4.0 */
      ? HtmlWebpackPlugin.getHooks(tappable).afterTemplateExecution.tapAsync(name, plugin)
      : module.exports.tap(tappable, 'html-webpack-plugin-before-html-processing', name, plugin)
      ;
  } catch (_) {
    // ignore
  }
};

/* istanbul ignore next */
module.exports.getContext = (loader) => (loader.options && loader.options.context) || loader.rootContext;

const parseAuthor = require('parse-author');
const camelCase = require('camelcase');

/* istanbul ignore next */
module.exports.getPublicPath = ({outputOptions: {publicPath = ''}}) => (
    (publicPath.length && publicPath.substr(-1) !== '/')
  ? publicPath + '/'
  : publicPath
);

/* istanbul ignore next */
module.exports.getAssetPath = ({mainTemplate}, name, args) => (
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

/**
 * Normalize author to {name, email, url}
 */
module.exports.getAuthor = (pkg) => (
    typeof pkg.author === 'string'
  ? parseAuthor(pkg.author)
  : typeof pkg.author === 'object' && pkg.author
  ? {
      name: pkg.author.name,
      email: pkg.author.email,
      url: pkg.author.url,
    }
  : {}
);

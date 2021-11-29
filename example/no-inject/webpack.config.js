const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('../../src/');

module.exports = (env, args) => {
  return {
    context: __dirname,
    entry: './src/app.js',
    output: {
      path: resolve(__dirname, 'public'),
      publicPath: '/',
      filename: 'app.js'
    },
    cache: {
      type: 'filesystem',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        inject: false
      }),
      new FaviconsWebpackPlugin({
        // Your source logo (required)
        logo: './src/favicon.png',
        // Favicon generation mode which is used if webpack is in `production` mode
        // Can be set to:
        // `webapp` (Slow but production ready favicon geneation)
        // `light` (Limited but fast favicon geneation during development)
        mode: 'webapp',
        // Favicon generation mode which is used if webpack is in `development` mode
        // Can be set to:
        // `webapp` (Slow but production ready favicon geneation)
        // `light` (Limited but fast favicon geneation during development)
        devMode: 'light',
        // Path to store cached data or false/null to disable caching altogether
        // Note: disabling caching may increase build times considerably
        cache: '.wwp-cache',
        // Prefix path for generated assets
        prefix: 'assets/',
        // Inject html links/metadata (requires html-webpack-plugin)
        inject: true,
        // Favicons configuration options. Read more on: https://github.com/evilebottnawi/favicons#usage
        favicons: {
          appName: 'My WebApp with WebApp Webpack Plugin',              // Your application's name. `string`
          appShortName: 'WebApp',                                         // Your application's short name. `string` : Not implemented
          appDescription: 'Demo: How to use the webapp webpack plugin', // Your application's description. `string`
          developerName: 'Fake developer',                              // Your (or your developer's) name. `string`
          developerURL: "https://github.com/fake-developer/",           // Your (or your developer's) URL. `string`
          dir: 'auto',                                                  // Primary text direction for name, short_name, and description
          lang: 'en-US',                                                // Primary language for name and short_name
          background: '#AAA',                                           // Background colour for flattened icons. `string`
          theme_color: '#BBB',                                          // Theme color user for example in Android's task switcher. `string`
          display: "standalone",                                        // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
          appleStatusBarStyle: 'black-translucent',                       // Color for appleStatusBarStyle : Not implemented (black-translucent | default | black)
          orientation: 'any',                                           // Default orientation: "any", "natural", "portrait" or "landscape". `string`
          start_url: "/?utm_source=homescreen",                         // Start URL when launching the application from a device. `string`
          scope: '.',                                                     // Color for appleStatusBarStyle : Not implemented
          version: "1.0.0",                                             // Your application's version string. `string`
          logging: false,                                               // Print logs to console? `boolean`
          icons: {
            // Platform Options:
            // - offset - offset in percentage
            // - background:
            //   * false - use default
            //   * true - force use default, e.g. set background for Android icons
            //   * color - set background for the specified icons
            //
            android: true,              // Create Android homescreen icon. `boolean` or `{ offset, background }`
            appleIcon: true,            // Create Apple touch icons. `boolean` or `{ offset, background }`
            appleStartup: true,         // Create Apple startup images. `boolean` or `{ offset, background }`
            coast: true,                // Create Opera Coast icon. `boolean` or `{ offset, background }`
            favicons: true,             // Create regular favicons. `boolean`
            firefox: true,              // Create Firefox OS icons. `boolean` or `{ offset, background }`
            windows: true,              // Create Windows 8 tile icons. `boolean` or `{ background }`
            yandex: true                // Create Yandex browser icon. `boolean` or `{ background }`
          }
        },
      }),
    ],
    stats: "errors-only"
  };
}

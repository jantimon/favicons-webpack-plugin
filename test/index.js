import test from 'ava'
import path from 'path'
import rimraf from 'rimraf'
import AppManifestWebpackPlugin from '..'
import denodeify from 'denodeify'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import dircompare from 'dir-compare'
import shell from 'shelljs'

const webpack = denodeify(require('webpack'))

const LOGO_PATH = path.resolve(__dirname, 'fixtures/logo.png')
const compareOptions = { compareSize: true, excludeFilter: 'bundle.js,*.png' }

rimraf.sync(path.resolve(__dirname, '../dist'))

function baseWebpackConfig(plugin, testName) {
  return {
    devtool: 'eval',
    entry: path.resolve(__dirname, 'fixtures/entry.js'),
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, '../dist', `${testName}`),
    },
    plugins: [].concat(plugin),
  }
}

test(`should throw error when called without arguments`, async t => {
  t.plan(2)
  let plugin
  try {
    plugin = new AppManifestWebpackPlugin()
  } catch (err) {
    t.is(err.message, 'app-manifest-webpack-plugin: options are required')
  }
  t.is(plugin, undefined)
})

test(`should take a string as argument`, async t => {
  const plugin = new AppManifestWebpackPlugin(LOGO_PATH)
  t.is(plugin.options.logo, LOGO_PATH)
})

test(`should take an object with just the logo as argument`, async t => {
  const plugin = new AppManifestWebpackPlugin({ logo: LOGO_PATH })
  t.is(plugin.options.logo, LOGO_PATH)
})

test(`should generate the expected default result`, async t => {
  const stats = await webpack(
    baseWebpackConfig(
      new AppManifestWebpackPlugin({
        logo: LOGO_PATH,
        inject: false,
      }),
    ),
  )
  const outputPath = stats.compilation.compiler.outputPath
  const expected = path.resolve(__dirname, 'fixtures/expected/default')
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions)
  const diffFiles = compareResult.diffSet.filter(diff => diff.state !== 'equal')
  t.is(diffFiles[0], undefined)
})

test(`should generate a configured JSON file`, async t => {
  const stats = await webpack(
    baseWebpackConfig(
      new AppManifestWebpackPlugin({
        logo: LOGO_PATH,
        emitStats: true,
        persistentCache: false,
        statsFilename: 'iconstats.json',
        inject: false,
      }),
      'generate-json',
    ),
  )
  const outputPath = stats.compilation.compiler.outputPath
  const expected = path.resolve(__dirname, 'fixtures/expected/generate-json')
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions)
  const diffFiles = compareResult.diffSet.filter(diff => diff.state !== 'equal')
  t.is(diffFiles[0], undefined)
})

test(`should work together with the html-webpack-plugin`, async t => {
  const stats = await webpack(
    baseWebpackConfig(
      [
        new HtmlWebpackPlugin(),
        new AppManifestWebpackPlugin({
          logo: LOGO_PATH,
          statsFilename: 'iconstats.json',
          persistentCache: false,
        }),
      ],
      'generate-html',
    ),
  )
  const outputPath = stats.compilation.compiler.outputPath
  const expected = path.resolve(__dirname, 'fixtures/expected/generate-html')
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions)
  const diffFiles = compareResult.diffSet.filter(diff => diff.state !== 'equal')
  t.is(diffFiles[0], undefined)
})

test(`should work together with the html-webpack-plugin with custom path`, async t => {
  const stats = await webpack(
    baseWebpackConfig(
      [
        new HtmlWebpackPlugin(),
        new AppManifestWebpackPlugin({
          logo: LOGO_PATH,
          output: '/static/assets/',
          statsFilename: 'iconstats.json',
          persistentCache: false,
        }),
      ],
      'generate-html-with-subfolder',
    ),
  )
  const outputPath = stats.compilation.compiler.outputPath
  const expected = path.resolve(__dirname, 'fixtures/expected/generate-html-with-subfolder')
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions)
  const diffFiles = compareResult.diffSet.filter(diff => diff.state !== 'equal')
  t.is(diffFiles[0], undefined)
})

test(`should not recompile if there is a cache file`, async t => {
  const options = baseWebpackConfig(
    [
      new HtmlWebpackPlugin(),
      new AppManifestWebpackPlugin({
        logo: LOGO_PATH,
        persistentCache: true,
      }),
    ],
    'from-cache',
  )

  // Bring cache file in place
  const cacheFile = '.cache'
  const cacheFileExpected = path.resolve(__dirname, 'fixtures/expected/from-cache/', cacheFile)
  const cacheFileDist = path.resolve(__dirname, options.output.path, cacheFile)
  shell.mkdir('-p', path.dirname(cacheFileDist))
  shell.cp(cacheFileExpected, path.dirname(cacheFileDist))

  const stats = await webpack(options)
  const outputPath = stats.compilation.compiler.outputPath

  const expected = path.resolve(__dirname, 'fixtures/expected/from-cache')
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions)
  // console.log('compareResult', compareResult)
  const diffFiles = compareResult.diffSet.filter(diff => diff.state !== 'equal')
  t.is(diffFiles[0], undefined)
})

test(`should has html encoded string in stats file`, async t => {
  const stats = await webpack(
    baseWebpackConfig(
      [
        new HtmlWebpackPlugin(),
        new AppManifestWebpackPlugin({
          logo: LOGO_PATH,
          emitStats: true,
          statsFilename: 'iconstats.json',
          statsEncodeHtml: true,
        }),
      ],
      'generate-json-with-escaped-html',
    ),
  )
  const outputPath = stats.compilation.compiler.outputPath
  const expected = path.resolve(__dirname, 'fixtures/expected/generate-json-with-escaped-html')
  const compareResult = await dircompare.compare(outputPath, expected, compareOptions)
  const diffFiles = compareResult.diffSet.filter(diff => diff.state !== 'equal')
  t.is(diffFiles[0], undefined)
})

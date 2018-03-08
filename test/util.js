import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import webpack from 'webpack';
import merge from 'webpack-merge';
import dircompare from 'dir-compare';

import {tapAsync} from '../lib/util';

const fixtures = path.resolve(__dirname, 'fixtures');
module.exports.expected = path.resolve(fixtures, 'expected');
module.exports.logo = path.resolve(fixtures, 'logo.svg');

module.exports.generate = async (config) => {
  config = merge(
    {
      entry: path.resolve(fixtures, 'entry.js'),
      output: {
        path: await fs.mkdtemp(path.join(os.tmpdir(), 'WWP')),
      },
    },
    config,
  );

  config.plugins
    .filter(plugin => plugin.constructor.name === 'HtmlWebpackPlugin')
    .forEach(plugin => {
      plugin.options.chunks = [];
    });

  const compiler = webpack(config);

  tapAsync(compiler, 'emit', 'Test', ({assets}, callback) => {
    Object.keys(assets)
      .filter(asset => asset.match(/.js$/))
      .forEach(asset => {
        delete assets[asset];
      });

    callback();
  });

  return await new Promise((resolve, reject) => {
    compiler.run((err, stats) => (err || stats.hasErrors())
      ? reject(err || stats.toJson().errors)
      : resolve(stats)
    );
  });
};

module.exports.compare = async (a, b) => {
  const diff = await dircompare.compare(a, b, {
    compareContent: true,
  });

  return diff.diffSet.filter(({state}) => state !== 'equal').map(({name1, name2}) => (
    `${path.join(a, name1 + '')} ≠ ${path.join(b, name2 + '')}`)
  );
};

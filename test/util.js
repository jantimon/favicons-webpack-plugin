import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import webpack from 'webpack';
import denodeify from 'denodeify';
import dircompare from 'dir-compare';

const fixtures = path.resolve(__dirname, 'fixtures');
module.exports.expected = path.resolve(fixtures, 'expected');
module.exports.logo = path.resolve(fixtures, 'logo.svg');

module.exports.generate = async (plugins) => await denodeify(webpack)({
  entry: path.resolve(fixtures, 'entry.js'),
  output: {
    filename: 'bundle.js',
    path: await fs.mkdtemp(path.join(os.tmpdir(), 'WWP')),
  },
  plugins,
});

module.exports.compare = async (a, b) => {
  const diff = await dircompare.compare(a, b, {
    compareContent: true,
    excludeFilter: 'bundle.js',
  });
  return diff.diffSet.filter(({state}) => state !== 'equal').map(({name1, name2}) => (
    `${path.join(a, name1 + '')} ≠ ${path.join(b, name2 + '')}`)
  );
};

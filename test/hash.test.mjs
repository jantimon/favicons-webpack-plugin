import { describe, it } from 'node:test';
import { getContentHash } from '../src/hash.js';

describe('getContentHash', () => {
  it('computes hash value properly', (t) => {
    t.assert.equal('', getContentHash());
    t.assert.equal('', getContentHash(undefined));
    t.assert.equal('', getContentHash(null));
    t.assert.equal('', getContentHash(''));

    t.assert.equal(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      getContentHash('hello'),
    );
    t.assert.equal(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      getContentHash(null, 'hell', null, 'o', undefined),
    );

    t.assert.equal(
      '936a185caaa266bb9cbe981e9e05cb78cd732b0b3280eb944412bb6f8f8f07af',
      getContentHash('hello', 'world'),
    );
    t.assert.equal(
      '8376118fc0230e6054e782fb31ae52ebcfd551342d8d026c209997e0127b6f74',
      getContentHash('world', 'hello'),
    );
  });
});

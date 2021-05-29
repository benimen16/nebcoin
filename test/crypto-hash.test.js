const { cryptoHash } = require('../backend/utils');

describe('cryptoHash()', () => {
  it('Generates a SHA-256 hashed output', () => {
    expect(cryptoHash('nebcoin to the moon'))
      .toEqual('7ef079ee882d6a18c93984db5bcf6c2a540071a234b820df7f5d803120341461');
  });

  it('Produces same hash with same args in any order', () => {
    expect(cryptoHash('one', 'two', 'three'))
      .toEqual(cryptoHash('three', 'one', 'two'));
  });

  it('Reproduces a unique hash when the properties change inside an input', () => {
    const foo = {};
    const originalHash = cryptoHash(foo);
    foo['a'] = 'a';

    expect(cryptoHash(foo)).not.toEqual(originalHash);
  });
});
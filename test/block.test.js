const hexToBinary = require('hex-to-binary');
const Block = require('../backend/core/blockchain/block');
const { GENESIS_DATA, MINE_RATE } = require('../backend/utils/config');
const { cryptoHash } = require('../backend/utils');

describe('Block', () => {
  const timestamp = 2000;
  const lastHash = 'lastHash';
  const hash = 'hash';
  const data = ['blockchain', 'data'];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({ timestamp, lastHash, hash, data, nonce, difficulty });

  it('Has a timestamp, lastHash, hash, and data property', () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('Returns a Block instance', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it('Returns genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mined data';
    const minedBlock = Block.mineBlock({ lastBlock, data });

    it('Returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('Sets the `lastHash` to be the `hash` of the lastBlock', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('Sets the `data`', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('Sets the `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('Creates a SHA-256 `hash` based on proper inputs', () => {
      expect(minedBlock.hash)
        .toEqual(cryptoHash(
            minedBlock.timestamp, 
            lastBlock.hash,
            minedBlock.nonce,
            minedBlock.difficulty, 
            data
          ));
    });

    it('Sets a `hash` that meets the difficuty criteria', () => {
      expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
        .toEqual('0'.repeat(minedBlock.difficulty));
    });

    it('Adjusts the difficulty', () => {
      const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
      expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
    });
  });

  describe('adjustDifficulty()', () => {
    it('Raises difficulty for quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE - 100 //subtract to make it lower than MINE_RATE
      })).toEqual(block.difficulty + 1);
    });

    it('Lowers difficulty for slowly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE + 100 //add to make it higher than MINE_RATE
      })).toEqual(block.difficulty - 1);
    });

    it('Has a lower limit of 1', () => {
      block.difficulty = -1;
      expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
    });
  });
});
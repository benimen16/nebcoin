const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../../utils/config');
const { cryptoHash } = require('../../utils');

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    let timestamp, hash;
    let { difficulty } = lastBlock;
    let nonce = 0;
    const lastHash = lastBlock.hash;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
      hash = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
    } while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({
      lastHash,
      timestamp,
      data,
      difficulty,
      nonce,
      hash
    })
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    const difference = timestamp - originalBlock.timestamp;

    if(difficulty < 1) return 1;

    if(difference > MINE_RATE) return difficulty - 1;

    return difficulty + 1;
  }
}

module.exports = Block;

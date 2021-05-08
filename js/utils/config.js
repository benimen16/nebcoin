const MINE_RATE = 1000; //in milliseconds 

const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'first-hash',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT = { address: '*** AUTHORIZED REWARD ***' }

const MINING_REWARD = 250000;

module.exports = { 
  GENESIS_DATA, 
  MINE_RATE, 
  STARTING_BALANCE,
  REWARD_INPUT,
  MINING_REWARD
};
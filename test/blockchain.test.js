const Blockchain = require('../backend/core/blockchain');
const Block = require('../backend/core/blockchain/block');
const Wallet = require('../backend/core/wallet');
const Transaction = require('../backend/core/wallet/transaction');
const { cryptoHash } = require('../backend/utils');

describe('Blockchain', () => {
  let blockchain, newChain, originalChain, errorMock;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    errorMock = jest.fn();

    originalChain = blockchain.chain;
    global.console.error = errorMock;
  })

  it('Contains a `chain` array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('Starts with the Genesis Block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('Adds a new Block to the chain', () => {
    const newData = 'ur mum lol';
    blockchain.addBlock({ data: newData });

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe('isValidChain()', () => {
    describe('When the chain does NOT start with the Genesis Block', () => {
      it('returns false', () => {
        blockchain.chain[0] = { data: 'fake-genesis' };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('When the chain starts with the Genesis Block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'Bears' });
        blockchain.addBlock({ data: 'Beets' });
        blockchain.addBlock({ data: 'Battlestar Galatica' });
      })

      describe('And a lastHash reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken yo';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('And the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'invalid data';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('And the chain does not contain any invalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });

      describe('And the chain does not have any jumped difficulties', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
          const badBlock = new Block({ timestamp, lastHash, hash, difficulty, nonce, data });

          blockchain.chain.push(badBlock);

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
    });
  });

  describe('replaceChain()', () => {
    let logMock;

    beforeEach(() => {
      logMock = jest.fn();
      global.console.log = logMock;
    });

    describe('When the new chain is NOT longer', () => {
      beforeEach(() => {
        newChain.chain[0] = { new: 'stuff' };
        blockchain.replaceChain(newChain.chain);
      });

      it('Does not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it('Logs an error', () => {
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('When the new chain IS longer', () => {
      beforeEach(() => {
        newChain.addBlock({ data: 'Bears' });
        newChain.addBlock({ data: 'Beets' });
        newChain.addBlock({ data: 'Battlestar Galatica' });
      });

      describe('And the chain is NOT valid', () => {
        beforeEach(() => {
          newChain.chain[2].hash = 'some fake shii';
          blockchain.replaceChain(newChain.chain);
        });
        
        it('Does not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain);
        });

        it('Logs an error', () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('And the chain IS valid', () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        })

        it('Replaces the chain', () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });

        it('Logs a log', () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });
    
    describe('And the validateTransactions flag is true', () => {
      it('Calls validTransactionData()', () => {
        const validateTransactionsDataMock = jest.fn();

        blockchain.validTransactionData = validateTransactionsDataMock;
        newChain.addBlock({ data: 'foo' });
        blockchain.replaceChain(newChain.chain, true);

        expect(validateTransactionsDataMock).toHaveBeenCalled();
      });
    });
  });

  describe('validTransactionData()', () => {
    let transaction, rewardTransaction, wallet;

    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        recipient: 'foo',
        amount: 69
      });
      rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
    });

    describe('And the transaction datat is valid', () => {
      it('returns true', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe('And the transaction data has multiple rewards', () => {
      it('Returns false and logs an error', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('And the transaction data has at least one malformed outputMap', () => {
      describe('And the transaction is NOT a reward transaction', () => {
        it('Returns false and logs an error', () => {
          transaction.outputMap[wallet.publicKey] = 999999;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('And the transaction is a reward transaction', () => {
        it('Returns false and logs an error', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });

    describe('And the transaction data has at least one malformed input', () => {
      it('Returns false and logs an error', () => {
        wallet.balance = 1000000;
        
        const outputMap = {
          [wallet.publicKey]: 999900,
          fooRecipient: 100
        };

        const badTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(outputMap)
          },
          outputMap
        };

        newChain.addBlock({ data: [badTransaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('And the block contains multiple identical transactions', () => {
      it('Returns false and logs an error', () => {
        newChain.addBlock({ data: [transaction, transaction, transaction, rewardTransaction] });
          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
      });
    });
  });
});
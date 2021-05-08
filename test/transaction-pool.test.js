const TransactionPool = require('../js/core/wallet/transaction-pool');
const Transaction = require('../js/core/wallet/transaction');
const Wallet = require('../js/core/wallet');
const Blockchain = require('../js/core/blockchain');

describe('TransactionPool', () => {
  let transactionPool, transaction, senderWallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      recipient: 'recipient',
      amount: 50
    });
  });

  describe('setTransaction()', () => {
    it('Adds a transaction', () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe('existingTransaction()', () => {
    it('Returns an existing transaction given an input address', () => {
      transactionPool.setTransaction(transaction);

      expect(
        transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
      ).toBe(transaction);
    })
  });

  describe('validTransactions()', () => {
    let validTransactions, errorMock;

    beforeEach(() => {
      validTransactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock;

      for(let i = 0; i < 10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: 'any-recipient',
          amount: 10
        });

        if(i % 3 === 0) {
          transaction.input.amount = 9999999;
        } else if(i % 3 === 1) {
          transaction.input.signature = new Wallet().sign('fake-lol');
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it('Returns valid transactions', () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });

    it('Logs error messages', () => {
      transactionPool.validTransactions();
      expect(errorMock).toHaveBeenCalled();
    })
  });

  describe('clear()', () => {
    it('Clears the transactions', () => {
      transactionPool.clear();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing blockchain transactions', () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};

      for(let i = 0; i < 5; i++) {
        const transaction = new Wallet().createTransaction({
          recipient: 'foo',
          amount: 15
        });

        transactionPool.setTransaction(transaction);

        if(i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
      }

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
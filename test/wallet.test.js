const Blockchain = require('../js/core/blockchain');
const Wallet = require('../js/core/wallet');
const Transaction = require('../js/core/wallet/transaction');
const { verifySignature } = require('../js/utils');
const { STARTING_BALANCE } = require('../js/utils/config');

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('Has a `balance`', () => {
    expect(wallet).toHaveProperty('balance');
  });

  it('Has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('Signing data', () => {
    const data = 'foo-bar';

    it('Verifies a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });

    it('Does NOT verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false);
    });
  });

  describe('createTransaction()', () => {
    describe('And the amount exceeds wallet balance', () => {
      it('Throws an error', () => {
        expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-bar' }))
          .toThrow('Transaction amount exceeds current balance');
      });
    });

    describe('And the amount is valid', () => {
      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it('Creates and instance of Transaction', () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it('Matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('Outputs the amount to the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });

    describe('And a chain is passed', () => {
      it('Calls Wallet.calculateBalance()', () => {
        const calculateBalanceMock = jest.fn();
        const originalCalculateBalance = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          recipient: 'foo',
          amount: 69,
          chain: new Blockchain().chain
        });

        expect(calculateBalanceMock).toHaveBeenCalled();

        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe('calculateBalance()', () => {
    let blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe('And there are no outputs for the wallet', () => {
      it('Returns the STARTING_BALANCE', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain,
            address: wallet.publicKey
          })
        ).toEqual(STARTING_BALANCE);
      });
    });

    describe('And there are outputs for the wallet', () => {
      let transactionOne, transactionTwo;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 50
        });
        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 60
        });

        blockchain.addBlock({ data: [transactionOne,transactionTwo] });
      });

      it('Adds the sum of all the outputs to the wallet', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey 
          })
        ).toEqual(
          STARTING_BALANCE + 
          transactionOne.outputMap[wallet.publicKey] + 
          transactionTwo.outputMap[wallet.publicKey]
        );
      });

      describe('And the wallet has made a transaction', () => {
        let recentTransaction;

        beforeEach(() => {
          recentTransaction = wallet.createTransaction({
            recipient: 'foo',
            amount: 69
          });

          blockchain.addBlock({ data: [recentTransaction] });
        });

        it('Returns the output amount of the recent transaction', () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            })
          ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
        });

        describe('And there are outputs next to and after the recent transaction', () => {
          let sameBlockTransaction, nextBlockTransaction;

          beforeEach(() => {
            recentTransaction = wallet.createTransaction({
              recipient: 'next-foo',
              amount: 50
            });

            sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
            blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });
            
            nextBlockTransaction = new Wallet().createTransaction({
              recipient: wallet.publicKey,
              amount: 70
            });
            blockchain.addBlock({ data: [nextBlockTransaction] });
          });

          it('Includes the output amounts in the returned balance', () => {
            expect(
              Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey
              })
            ).toEqual(
              recentTransaction.outputMap[wallet.publicKey] + 
              sameBlockTransaction.outputMap[wallet.publicKey] +
              nextBlockTransaction.outputMap[wallet.publicKey]
            );
          });
        })
      });
    });
  });
});
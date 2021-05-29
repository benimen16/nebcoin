const Transaction = require('../backend/core/wallet/transaction');
const Wallet = require('../backend/core/wallet');
const { verifySignature } = require('../backend/utils');
const { REWARD_INPUT, MINING_REWARD } = require('../backend/utils/config');

describe('Transaction', () => {
  let transaction, senderWallet, recipient, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = 'recipient-public-key';
    amount = 50;
    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it('Has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  describe('outputMap', () => {
    it('Has an `outputMap`', () => {
      expect(transaction).toHaveProperty('outputMap');
    });

    it('Outputs the amount to the recipient', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it('Outputs the remaining amount for the senderWallet', () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
    });
  });

  describe('Input', () => {
    it('Has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });

    it('Has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('Sets the `amount` to the senderWallet balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    }); 

    it('Sets the address to the senderWallet publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it('Signs the input', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature
        })
      ).toBe(true);
    });
  });

  describe('validTransaction()', () => {
    let errorMock;

    beforeEach(() => {
      errorMock = jest.fn();
      global.console.error = errorMock;
    })

    describe('When transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.validTransaction(transaction)).toBe(true);
      })
    });

    describe('When transaction is NOT valid', () => {
      describe('And a transaction outputMap value is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.outputMap[senderWallet.publicKey] = 9999999; //something way outside wallet balance
          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        })
      });

      describe('And the transaction input signature is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.input.signature = new Wallet().sign('fake');
          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        })
      });
    });
  });

  describe('update()', () => {
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    describe('And the amount is invalid', () => {
      it('Throws an error', () => {
        expect(() => {
          transaction.update({ senderWallet, recipient: 'foo', amount: 999999 });
        }).toThrow('Transaction amount exceeds current balance');
      });
    });

    describe('And the amount is valid', () => {
      beforeEach(() => {
        originalSignature = transaction.input.signature;
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        nextRecipient = 'next-recipient';
        nextAmount = 50;
  
        transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount });
      });
  
      it('Outputs the amount to next recipient', () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
      });
  
      it('Subtracts the amount from the original sender output amount', () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
      });
  
      it('Maintains a total output that matches the input amount', () => {
        expect(
          Object.values(transaction.outputMap)
            .reduce((total, outputAmount) => total + outputAmount)
        ).toEqual(transaction.input.amount);
      });
  
      it('Re-signs the transaction', () => {
        expect(transaction.input.signature).not.toEqual(originalSignature);
      });

      describe('And another update for same recipient', () => {
        let addedAmount;

        beforeEach(() => {
          addedAmount = 80;
          transaction.update({ senderWallet, recipient: nextRecipient, amount: addedAmount });
        });

        it('Adds to the recipient amount', () => {
          expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
        });

        it('Subtracts the amount from the original sender output amount', () => {
          expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount);
        });
      });
    });
  });

  describe('rewardTransaction()', () => {
    let rewardTransaction, minerWallet;

    beforeEach(() => {
      minerWallet = new Wallet();
      rewardTransaction = Transaction.rewardTransaction({ minerWallet });
    });

    it('Creates a transaction with the reward input', () => {
      expect(rewardTransaction.input).toEqual(REWARD_INPUT);
    });

    it('Creates one transaction for the miner with MINING_REWARD', () => {
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
    });
  });
});
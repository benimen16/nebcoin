import React from 'react';

const Transaction = ({ transaction }) => {
  const { input, outputMap } = transaction;
  const recipients = Object.keys(outputMap);

  return(
    <div>
      <div>
        From: { `${ input.address.substring(0, 20) }...` }
        <br />
        Balance: { input.amount }
      </div>
      {
        recipients.map(recipient => {
          return(
            <div>
              To: { `${recipient.substring(0, 20)}...` }
              <br />
              Sent: { outputMap[recipient] }
            </div>
          );
        })
      }
    </div>
  );
}

export default Transaction;
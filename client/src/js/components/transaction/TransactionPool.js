import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../../history';
import Transaction from './transaction';

const POOL_INTERVAL_MILLISECONDS = 10000;

class TransactionPool extends Component {
  state = { transactionPoolMap: {} };
  
  fetchTransactionPoolMap = () => {
    fetch(`${document.location.origin}/api/transaction-pool-map`)
      .then(response => response.json())
      .then(json => this.setState({ transactionPoolMap: json }));    
  }

  fetchMineTransactions = () => {
    fetch(`${document.location.origin}/api/mine-transactions`)
      //change this to actually mine shit continuously until user stops
      //as long as there are blocks to mine
      .then(response => {
        if(response.status === 200) {
          alert('success');
          history.push('/blocks');
        } else {
          alert('Request did not complete');
        }
      })
  }

  componentDidMount() {
    this.fetchTransactionPoolMap();

    this.fetchInterval = setInterval(
      () => this.fetchTransactionPoolMap(),
      POOL_INTERVAL_MILLISECONDS
    );
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    return(
      <div>
        <div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/blocks">Blocks</Link></li>
            <li><Link to="/conduct-transaction">Send/Recieve</Link></li>
            <li><Link to="/transaction-pool">Transaction Pool</Link></li>
          </ul>
        </div>
        <h3>Transaction Pool</h3>
        {
          Object.values(this.state.transactionPoolMap).map(transaction => {
            return(
              <div key={transaction.id}>
                <hr />
                <Transaction transaction={transaction} />
              </div>
            );
          })
        }
        <div>
          <Button 
            bsStyle="primary"
            onClick={this.fetchMineTransactions}
          >
            Mine Blocks
          </Button>
        </div>
      </div>
    );
  }
}

export default TransactionPool;
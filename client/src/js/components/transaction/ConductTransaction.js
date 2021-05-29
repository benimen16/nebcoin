import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../../history';

class ConductTransaction extends Component {
  state = { recipient: '', amount: 0 };

  updateRecipient = event => {
    this.setState({ recipient: event.target.value });
  }

  updateAmount = event => {
    this.setState({ amount: Number(event.target.value) });
  }

  conductTransaction = () => {
    const { recipient, amount } = this.state;

    fetch(`${document.location.origin}/api/transact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount })
    }).then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
        history.push('/transaction-pool');
      });
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
        <h3>Create Transaction</h3>
        <FormGroup>
          <FormControl 
            input="text"
            placeholder="Recipient Address"
            value={this.state.recipient}
            onChange={this.updateRecipient}
          />
        </FormGroup>
        <FormGroup>
          <FormControl 
            input="number"
            placeholder="Recipient Amount"
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </FormGroup>
        <div>
          <Button
            bsStyle="primary"
            onClick={this.conductTransaction}
          >
            Send
          </Button>
        </div>
      </div>
    );
  }
}

export default ConductTransaction;
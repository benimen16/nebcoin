import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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

    fetch('http://localhost:8000/api/transact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount })
    }).then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
      });
  }

  render() {
    return(
      <div>
        <div>
          <Link to="/">Home</Link> | <Link to="/blocks">Blocks</Link> | <Link to="/conduct-transaction">Send/Recieve</Link>
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
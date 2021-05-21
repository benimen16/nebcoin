import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class App extends Component {
  state = { walletInfo: {} };

  componentDidMount() {
    fetch(`${document.location.origin}/api/wallet-info`)
      .then(response => response.json())
      .then(json => this.setState({ walletInfo: json }));
  }

  render() {
    const { address, balance } = this.state.walletInfo;

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
        <div>Address: { address }</div>
        <div>Balance: { balance }</div>
      </div>
    );
  }
}

export default App;
import React, { Component } from 'react';
import Blocks from './block/Blocks';

class App extends Component {
  state = { walletInfo: {} };

  componentDidMount() {
    fetch('http://localhost:8000/api/wallet-info')
      .then(response => response.json())
      .then(json => this.setState({ walletInfo: json }));
  }

  render() {
    const { address, balance } = this.state.walletInfo;

    return(
      <div>
        Welcome to the blockchain
        <div>Address: { address }</div>
        <div>Balance: { balance }</div>
        <div>
          <Blocks />
        </div>
      </div>
    );
  }
}

export default App;
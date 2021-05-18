import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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
        <div>
          <Link to="/">Home</Link> | <Link to="/blocks">Blocks</Link>
        </div>
        <div>Address: { address }</div>
        <div>Balance: { balance }</div>
      </div>
    );
  }
}

export default App;
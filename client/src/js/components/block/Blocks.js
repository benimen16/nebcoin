import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Block from './Block';

class Blocks extends Component {
  state = { blocks: [] };

  componentDidMount() {
    fetch(`${document.location.origin}/api/blocks`)
      .then(response => response.json())
      .then(json => this.setState({ blocks: json }));
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
        <h3>Blocks</h3>
        {
          this.state.blocks.map(block => {
            return(
              <div key={block.hash}>
                <Block block={block} />
              </div>
            );
          })
        }
      </div>
    );
  }
}

export default Blocks;
import React, { Component } from 'react';
import Block from './Block';

class Blocks extends Component {
  state = { blocks: [] };

  componentDidMount() {
    fetch('http://localhost:8000/api/blocks')
      .then(response => response.json())
      .then(json => this.setState({ blocks: json }));
  }

  render() {
    console.log(this.state);

    return(
      <div>
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
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Switch } from 'react-router-dom';
import history from './history';
import App from './components/App';
import Blocks from './components/block/Blocks';
import ConductTransaction from './components/transaction/ConductTransaction';
import TransactionPool from './components/transaction/TransactionPool';
import '../css/index.css';

render(
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/blocks" component={Blocks} />
      <Route path="/conduct-transaction" component={ConductTransaction} />
      <Route path="/transaction-pool" component={TransactionPool} />
    </Switch>
  </Router>, 
  document.getElementById('root')
);
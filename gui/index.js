import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import Layout from './app/pages/Layout';
import Featured from './app/pages/Featured';
import Mirror from './app/pages/Mirror';
import Query from './app/pages/Query';
import Createinstance from './app/pages/Createinstance';

const app = document.getElementById('app');

var currentinstance="onetest";

class Main extends React.Component {

  constructor(){
    super();
  }
  //
  // getInstance(){
  //   return "test two";
  // }
  //
  // changeInstance(newInstance){
  //   console.log('source');
  //   // this.setState({instance: newInstance});
  //   currentinstance=newInstance;
  // }

  render(){
    return(
    <Router history={hashHistory}>
      <Route path="/" component={Layout} >
        <IndexRoute component={Mirror} ></IndexRoute>
        <Route path="mirror" component={Mirror}></Route>
        <Route path="featured" component={Featured}></Route>
        <Route path="createinstance" component={Createinstance}></Route>
        <Route path="query" component={Query}></Route>
      </Route>
    </Router>
  )
  }
}

ReactDOM.render(
  <Main />,
  app
)

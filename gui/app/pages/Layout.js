import React from "react";
import { Link } from "react-router";

import Header from "../components/Header";
import Footer from "../components/Footer";


class Layout extends React.Component {

  constructor(){
    super();
    // console.log(this.props);
  }

  render(){
    return (
      <div>
        <Header />
        {this.props.children}
      </div>
    );
  }

}

export default Layout

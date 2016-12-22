import React from "react";
import { Link } from "react-router";

import InstanceDropdown from "../components/InstanceDropdown";

export default class Header extends React.Component {

  constructor(){
    super();
  }

  render(){
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="#">Demeter App</a>
            </div>

            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul className="nav navbar-nav">
                <li><Link to="mirror">Mirror</Link></li>
                <li><Link to="createinstance">Create Instance</Link></li>
                <li><Link to="query">Query</Link></li>
                <li><Link to="featured">Admin</Link></li>
              </ul>

              <div id="instance-dropdown">
                <InstanceDropdown />
              </div>

            </div>
          </div>
          </nav>

          <div id="notification-mirror" />
          <div id="notification-download" />

      </div>
    )
  }

}

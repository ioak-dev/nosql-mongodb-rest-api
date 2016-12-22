import React from "react";
import ReactDOM from "react-dom";

import Notification from "../components/Notification";

export default class Featured extends React.Component {
  constructor() {
    super();
    // loadMirror();

    this.state = {
      "notification_show": false,
      "notification_message": "",
      "notification_type": ""
    }
  }

  componentDidMount(){
    
  }

  render(){
    return (
      <div>
        <Notification show={this.state.notification_show} type={this.state.notification_type} message={this.state.notification_message} />
        <p>"Featured"</p>
      </div>
    )
  }

}

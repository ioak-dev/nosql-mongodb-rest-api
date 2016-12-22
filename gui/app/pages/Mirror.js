import React from "react";
import ReactDOM from "react-dom";
import { browserHistory } from 'react-router'

import Notification from "../components/Notification";

export default class Mirror extends React.Component {

  constructor(){
    super();
    this.state = {
      mirror: "",
      currentmirror: mirrorInstance,
      "notification_show": false,
      "notification_message": "",
      "notification_type": ""
    }
    this.handleMirrorChange = this.handleMirrorChange.bind(this);
    this.submit = this.submit.bind(this);
    this.reset = this.reset.bind(this);

    getDrivers();

  }

  componentDidMount(){
    $("#mirror").focus();
  }

  handleMirrorChange(event){
    this.setState({mirror: event.target.value});
  }

  submit(){

    if(this.state.mirror==undefined || this.state.mirror.trim()==''){
      this.setState({"notification_show": true});
      this.setState({"notification_message": " Not a valid input"});
      this.setState({"notification_type": "error"});
    } else {

      var oldMirror = mirrorInstance;

      mirrorInstance = this.state.mirror.replace(/^\s+|\s+$/gm,'');

      if(!mirrorInstance.endsWith('/')){
        mirrorInstance = mirrorInstance + "/";
      }

      if(!mirrorInstance.startsWith('http://') || mirrorInstance.startsWith('https://') || mirrorInstance.startsWith('www.')){
        mirrorInstance = "http://" + mirrorInstance;
      }

      this.setState({currentmirror: mirrorInstance});

      this.reset();

      var message = " Mirror updated successfully from " + oldMirror + " to " + mirrorInstance;

      this.setState({"notification_show": true});
      this.setState({"notification_type": "success"});
      this.setState({"notification_message": message });

      getDrivers();

    }
  }

  reset(){
    this.setState({mirror: ""});

    this.setState({"notification_show": false});
  }

  close(){
    browserHistory.goBack();
  }

  render(){
    return (
      <div>
        <Notification show={this.state.notification_show} type={this.state.notification_type} message={this.state.notification_message} />
        <div className="container">
          <div className="jumbotron2">
            <h1>Set / Update Mirror</h1>
            <br/>
          </div>
          <form>
          <div className="form-group row">
            <label htmlFor="currentmirror" className="col-sm-2 col-form-label">Current Mirror</label>
            <div className="col-sm-10">
              {this.state.currentmirror}
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="mirror" className="col-sm-2 col-form-label">New Mirror</label>
            <div className="col-sm-10">
              <input type="text" onChange={this.handleMirrorChange} value={this.state.mirror} className="form-control" id="mirror" placeholder="Mirror / REST Service provider URL"></input>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-2">
            </div>
            <div className="col-sm-10">
              <button type="button" onClick={this.submit} className="btn btn-primary">Update Mirror</button>
              <button type="button" onClick={this.reset} className="btn btn-secondary">Reset</button>
              <button type="button" onClick={this.close} className="btn btn-secondary">Close</button>
            </div>
          </div>
          </form>
        </div>
      </div>
    )
  }

}

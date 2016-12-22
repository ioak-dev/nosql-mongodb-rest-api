import React from "react";
import ReactDOM from "react-dom";
import { browserHistory } from 'react-router'

import Notification from "../components/Notification";
import InstanceDropdown from "../components/InstanceDropdown";

// var mirror;

// function loadMirror(){
//
//   var file = "./app/config/mirror.cfg";
//
//   jQuery.ajaxSetup({async:false});
//
//   $.get(file,function(txt){
//       mirror = txt;
//   });
//
// }

export default class Createinstance extends React.Component {

  constructor() {
    super();
    // loadMirror();

    var driver = '';

    if(drivers.length>0){
      driver = drivers[0];
    }

    this.state = {
      "instanceName":"",
      "driver":driver,
      "uri":"",
      "databaseName":"",
      "notification_show": false,
      "notification_message": "",
      "notification_type": ""
    }

    this.handleInstanceNameChange = this.handleInstanceNameChange.bind(this);
    this.handleDriverChange = this.handleDriverChange.bind(this);
    this.handleUriChange = this.handleUriChange.bind(this);
    this.handleDatabaseNameChange = this.handleDatabaseNameChange.bind(this);

    this.submit = this.submit.bind(this);
    this.restCall = this.restCall.bind(this);
    this.reset = this.reset.bind(this);

  }

  componentDidMount(){
    $("#instanceName").focus();
  }

  handleInstanceNameChange(event){
    this.setState({instanceName: event.target.value});
  }

  handleDriverChange(event){
    this.setState({driver: event.target.value});
  }

  handleUriChange(event){
    this.setState({uri: event.target.value});
  }

  handleDatabaseNameChange(event){
    this.setState({databaseName: event.target.value});
  }

  submit(){

    this.restCall();

  }

  reset(){
    this.setState({instanceName: ""});
    this.setState({driver: ""});
    this.setState({uri: ""});
    this.setState({databaseName: ""});

    this.setState({notification_show: false});
  }

  restCall() {

    var remote_url = mirrorInstance + "demeter-core/rest/instance";

    var contentType = 'application/json';

    var data = {
      "driver": this.state.driver,
      "key": this.state.instanceName,
      "value": {
        "uri": this.state.uri,
        "database": this.state.databaseName
      }
    }

    $.ajax({
        type: "POST",
        data: JSON.stringify(data) ,
        url: remote_url,
        async: true,
        crossDomain: true,
        success: function (response) {
          this.handleSuccess(response);
        }.bind(this),
        error: function (outcome) {
          this.handleError(outcome);
        }.bind(this)
    })
  }

  handleSuccess(response){

      var message = " Instance " + this.state.instanceName + " created successfully";
      this.reset();

      this.setState({notification_show: true});
      this.setState({notification_message: message});
      this.setState({notification_type: "success"});

      ReactDOM.render(<div />, document.getElementById("instance-dropdown"));
      ReactDOM.render(<InstanceDropdown />, document.getElementById("instance-dropdown"));
  }

  handleError(outcome){
    var message = " " + outcome.status + " / " + outcome.statusText;

    this.setState({notification_show: true});
    this.setState({notification_message: message});
    this.setState({notification_type: "error"});
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
            <h1>Create database instance</h1>
            <br/>
          </div>
          <form>
            <div className="form-group row">
              <label htmlFor="instanceName" className="col-sm-3 col-form-label">Instance Name</label>
              <div className="col-sm-8">
                <input type="text" onChange={this.handleInstanceNameChange} value={this.state.instanceName} className="form-control" id="instanceName" placeholder="Instance name"></input>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="driver" className="col-sm-3 col-form-label">Database Driver</label>
              <div className="col-sm-8">
                <select ref="driver" onChange={this.handleDriverChange} className="form-control" value={this.state.driver}>
                 {
                   drivers.map(function(driver) {
                     return <option key={driver}
                       value={driver}>{driver}</option>;
                   })
                 }
               </select>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="uri" className="col-sm-3 col-form-label">Database URI</label>
              <div className="col-sm-8">
                <input type="text" onChange={this.handleUriChange} value={this.state.uri} className="form-control" id="driver" placeholder="Database connection URI"></input>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="databaseName" className="col-sm-3 col-form-label">Database Name</label>
              <div className="col-sm-8">
                <input type="text" onChange={this.handleDatabaseNameChange} value={this.state.databaseName} className="form-control" id="databaseName" placeholder="Database name"></input>
              </div>
            </div>
            <div className="form-group row">
              <div className="col-sm-3">
              </div>
              <div className="col-sm-8">
                <button type="button" onClick={this.submit} className="btn btn-primary">Create Instance</button>
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

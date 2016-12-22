import React from "react";
import ReactDOM from "react-dom";
import { browserHistory } from 'react-router'

import InstanceDropdown from "../components/InstanceDropdown";
import Notification from "../components/Notification";
import NotificationDownload from "../components/NotificationDownload";

function stringToJson(input){
  if(input.startsWith("{") || input.startsWith("[")){
    return JSON.parse(input);
  } else{
    return input;
  }
}

function stringToJsonBulk(inputArray){
  var outputArray = [];
  for(var i=0;i<inputArray.length;i++){
    var item = inputArray[i].trim();
    if(item){
      outputArray.push(stringToJson(item));
    }
  }

  return outputArray;
}

export default class Query extends React.Component {

    constructor(props) {
      super(props);
      // loadMirror();

      this.state = {
        "create_new": true,
        "guided_mode": true,
        "saved_queries_namelist":[''],
        "saved_queries":{},
        "existing_query_name": '',
        "existing_query": '{}',
        "select": [''],
        "tables":[''],
        "db_filter":[''],
        "memory_filter":[''],
        "join":[''],
        "parameters": {

        },
        "query_json": '{}',
        "save_query": false,
        "new_query_name": '',
        "format": "json",
        "notification_show": false,
        "notification_message": "",
        "notification_type": ""
      }

      this._isMounted = false;

      this.handleModeChange = this.handleModeChange.bind(this);
      this.handleExistingQueryNameChange = this.handleExistingQueryNameChange.bind(this);

      this.handleSelectChange = this.handleSelectChange.bind(this);
      this.handleTableChange = this.handleTableChange.bind(this);
      this.handleDbFilterChange = this.handleDbFilterChange.bind(this);
      this.handleMemoryFilterChange = this.handleMemoryFilterChange.bind(this);
      this.handleJoinChange = this.handleJoinChange.bind(this);
      this.handleParameterChange = this.handleParameterChange.bind(this);
      this.handleSaveQueryChange = this.handleSaveQueryChange.bind(this);
      this.handleNewQueryNameChange = this.handleNewQueryNameChange.bind(this);
      this.handleCreateNewChange = this.handleCreateNewChange.bind(this);
      // this.handleDriverChange = this.handleDriverChange.bind(this);
      // this.handleUriChange = this.handleUriChange.bind(this);
      // this.handleDatabaseNameChange = this.handleDatabaseNameChange.bind(this);

      this.findParameters = this.findParameters.bind(this);

      this.addSelect = this.addSelect.bind(this);
      this.addTable = this.addTable.bind(this);
      this.addDbFilter = this.addDbFilter.bind(this);
      this.addMemoryFilter = this.addMemoryFilter.bind(this);
      this.addJoin = this.addJoin.bind(this);

      this.handleQueryJsonChange = this.handleQueryJsonChange.bind(this);
      this.handleExistingQueryChange = this.handleExistingQueryChange.bind(this);
      this.handleFormatChange = this.handleFormatChange.bind(this);

      this.submit = this.submit.bind(this);
      this.restCallRun = this.restCallRun.bind(this);
      this.restCallSave = this.restCallSave.bind(this);
      this.handleSuccess = this.handleSuccess.bind(this);
      this.handleError = this.handleError.bind(this);
      this.reset = this.reset.bind(this);

    }

    componentDidMount(){
      this._isMounted = true;
    }

    componentWillUnmount(){alert('unmount');
      this._isMounted = false;
    }

    handleCreateNewChange(){
      this.setState({create_new: !this.state.create_new}, function(){
        this.findParameters();
      });

      if(this.state.create_new){
        this.restCallGetSavedQueries();
      }
    }

    restCallGetSavedQueries(){
      var remote_url = mirrorInstance + "demeter-core/rest/query/manage/" + selectedInstance;

      $.ajax({
          type: "GET",
          url: remote_url,
          async: true,
          crossDomain: true,
          success: function (response) {
            this.handleSuccessOnSavedQueriesRetrieval(response);
          }.bind(this),
          error: function (outcome) {
            // drivers = [];
          }.bind(this)
      })
    }

    handleSuccessOnSavedQueriesRetrieval(response){
        var savedQueriesNamelist = [''];
        var savedQueries = {};
        var responseJson = JSON.parse(response);

        for(var i=0;i<responseJson.length;i++){
          if(responseJson[i].hasOwnProperty('id')){
            savedQueriesNamelist.push(responseJson[i].id);
            savedQueries[responseJson[i].id] = responseJson[i];
          }
        }

        this.setState({saved_queries_namelist: savedQueriesNamelist});
        this.setState({saved_queries: savedQueries});
    }

    handleExistingQueryNameChange(event){

      var existingQuery = "{}";

      this.setState({existing_query_name: event.target.value});
      if(this.state.saved_queries.hasOwnProperty(event.target.value)){
        var query = this.state.saved_queries[event.target.value];
        var queryString = JSON.stringify(query, null, 4);

        existingQuery = queryString;
      }

      this.setState({existing_query: existingQuery}, function(){
          this.findParameters();
      });


    }


    handleModeChange(){
      this.setState({guided_mode: !this.state.guided_mode}, function(){
        this.findParameters();
      });
    }

    handleSelectChange(event, i){
      var element = this.state.select;
      element[i] = event.target.value;
      this.setState({select: element});
    }

    handleTableChange(event, i){
      var element = this.state.tables;
      element[i] = event.target.value;
      this.setState({tables: element});
    }

    handleDbFilterChange(event, i){
      var element = this.state.db_filter;
      element[i] = event.target.value;
      this.setState({db_filter: element});
    }

    handleMemoryFilterChange(event, i){
      var element = this.state.memory_filter;
      element[i] = event.target.value;
      this.setState({memory_filter: element});
    }

    handleJoinChange(event, i){
      var element = this.state.join;
      element[i] = event.target.value;
      this.setState({join: element});
    }

    handleParameterChange(event, key){
      var element = this.state.parameters;
      element[key][key] = event.target.value;
      this.setState({parameters: element});
    }

    handleQueryJsonChange(event){
      this.setState({query_json: event.target.value});
    }

    handleExistingQueryChange(event){
      this.setState({existing_query: event.target.value});
    }

    handleSaveQueryChange(){
      this.setState({save_query: !this.state.save_query});
    }

    handleNewQueryNameChange(event){
      this.setState({new_query_name: event.target.value});
    }

    handleUriChange(event){
      this.setState({uri: event.target.value});
    }

    handleDatabaseNameChange(event){
      this.setState({databaseName: event.target.value});
    }

    handleFormatChange(event){
      this.setState({format: event.target.value});
    }

    submit(){

      this.restCallRun();

          var message = " Query execution in progress. You will get a notification when the download completes";

          this.setState({notification_show: true});
          this.setState({notification_message: message});
          this.setState({notification_type: "success"});

    }

    constructQuery(){

      var query;

      if(!this.state.create_new){

        query = JSON.parse(this.state.existing_query);

      } else if(this.state.guided_mode){

        query = {
            "tables":this.state.tables
        };

        if(!(this.state.select.length == 1 && this.state.select[0] == "")){
          query["select"] = stringToJsonBulk(this.state.select);
        }

        if(!(this.state.memory_filter.length == 1 && this.state.memory_filter[0] == "")){
          query["filter-in-memory"] = this.state.memory_filter;
        }

        if(!(this.state.db_filter.length == 1 && this.state.db_filter[0] == "")){
          query["filter-in-db"] = this.state.db_filter;
        }

        if(!(this.state.join.length == 1 && this.state.join[0] == "")){
          query["join"] = this.state.join;
        }

      } else {
        query = JSON.parse(this.state.query_json);
      }

      return query;

    }

    constructParameters(){

      var parameters = [];

      if(Object.keys(this.state.parameters).length > 0){
        // query["join"] = this.state.join;
        for(var key in this.state.parameters) {
          parameters.push(this.state.parameters[key]);
        }

      }

      return parameters;

    }

    restCallRun() {

      var format='json';

      if(this.state.format=='json') {
        format = 'json';
      } else if (this.state.format=='json-flattened'){
        format = 'json?flatten=true';
      } else {
        format = 'delimited';
      }

      var remote_url = mirrorInstance + "demeter-core/rest/query/run/" + selectedInstance + "/" + format;

      var query = this.constructQuery();
      var parameters = this.constructParameters();

      var saveQuery = this.state.save_query;
      var newQueryName = '';

      if(saveQuery){
        newQueryName = this.state.new_query_name;
      }

      var data = {
        "query": query,
        "parameters": parameters
      }

      $.ajax({
        type: "POST",
        data: JSON.stringify(data) ,
        crossDomain: true,
        url: remote_url,
        async: true,
        success: function (response) {
            this.handleSuccess(response, saveQuery, newQueryName, query);
        }.bind(this),
        error: function () {
            this.handleError();
        }.bind(this)
      })

      this.findParameters();
    }

    restCallSave(query, queryName) {

      if(!queryName.trim()){

            var message = "Error saving query " + queryName + " query name not provided";

            this.setState({notification_show: true});
            this.setState({notification_message: message});
            this.setState({notification_type: "error"});

            return;
      }

      var remote_url = mirrorInstance + "demeter-core/rest/query/manage/" + selectedInstance;

      query["id"] = queryName;

      $.ajax({
        type: "POST",
        data: JSON.stringify(query) ,
        crossDomain: true,
        url: remote_url,
        async: true,
        success: function (response) {
            this.handleSuccessOnSave(response, queryName);
        }.bind(this),
        error: function (response) {
          console.log(response);
            this.handleErrorOnSave(queryName);
        }.bind(this)
      })
    }

    findParameters(){

      var query = JSON.stringify(this.constructQuery()).replace(new RegExp('{{}}', 'g'), '');

      var string = query,
      pattern = /{{(.+?)}}/g,
      match,
      matches = [];

      while (match = pattern.exec(string)) {
          matches.push(match[1]);
      }

      var matches = matches.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
      })

      var parameters = this.state.parameters;

      var keys = Object.keys(parameters);

      var tempMatchKey = {};

      for(var i=0; i<matches.length; i++){
        var key = matches[i];

        tempMatchKey[key] = key;

        if(keys.indexOf(key) == -1){
          var item = {};
          item[key] = [];
          parameters[key] = item;
        }

      }

      for(var i=0; i<keys.length; i++){
        if(!tempMatchKey.hasOwnProperty(keys[i])){
          delete parameters[keys[i]];
        }
      }

      this.setState({parameters: parameters});

    }

    handleSuccess(response, saveQuery, newQueryName, query){

      var json = JSON.parse(response);
      var downloadId = json.download_id;

      // ReactDOM.render(<Notification show={true} type="success" message={notification_message} />, document.getElementById("notification-download"));
      downloadKeys.push(downloadId);
      ReactDOM.render(<NotificationDownload />, document.getElementById("notification-download"));
alert(this._isMounted);
      if(this._isMounted){
        this.setState({notification_show: false});
      }

      if(saveQuery){
        this.restCallSave(query, newQueryName);
      }

    }

    handleError(){
      downloadKeys.push("error");
      ReactDOM.render(<NotificationDownload />, document.getElementById("notification-download"));
      if(this._isMounted){
        this.setState({notification_show: false});
      }
    }

    handleSuccessOnSave(response, queryName){

      var message = " Query saved successfully with name " + queryName;

      if(this._isMounted){
        this.setState({notification_show: true});
        this.setState({notification_message: message});
        this.setState({notification_type: "success"});
      }

    }

    handleErrorOnSave(queryName){

        var message = " Error saving query " + queryName;

        if(this._isMounted){
          this.setState({notification_show: true});
          this.setState({notification_message: message});
          this.setState({notification_type: "error"});
        }
    }


    reset(){
      this.setState({
        "create_new": true,
        "guided_mode": true,
        "saved_queries_namelist":[''],
        "saved_queries":{},
        "existing_query_name": '',
        "existing_query": '{}',
        "select": [''],
        "tables":[''],
        "db_filter":[''],
        "memory_filter":[''],
        "join":[''],
        "parameters": {

        },
        "query_json": '{}',
        "save_query": false,
        "new_query_name": '',
        "notification_show": false,
        "notification_message": "",
        "notification_type": ""
      }, function(){
        this.findParameters();
      });
    }

    close(){
      browserHistory.goBack();
    }

    addSelect(){
      var element = this.state.select;
      element.push('');
      this.setState({select: element});
    }

    addTable(){
      var element = this.state.tables;
      element.push('');
      this.setState({tables: element});
    }

    addDbFilter(){
      var element = this.state.db_filter;
      element.push('');
      this.setState({db_filter: element});
    }

    addMemoryFilter(){
      var element = this.state.memory_filter;
      element.push('');
      this.setState({memory_filter: element});
    }

    addJoin(){
      var element = this.state.join;
      element.push('');
      this.setState({join: element});
    }

    render(){

      var formElementCreateNew;

      if(this.state.guided_mode){
        formElementCreateNew =
        <div>

          <div className="form-group row">
            <VariableInput items={this.state.select} handleChange={this.handleSelectChange} validate={this.findParameters} label="Select" placeholder="Projection list / List of columns / JSON structured templates"/>
            <div className="col-sm-1">
              <button type="button" onClick={this.addSelect} className="btn btn-outline-secondary">+</button>
            </div>
          </div>

          <div className="form-group row">
            <VariableInput items={this.state.tables} handleChange={this.handleTableChange} validate={this.findParameters} label="Tables" placeholder="Table / Collection name with alias"/>
            <div className="col-sm-1">
              <button type="button" onClick={this.addTable} className="btn btn-outline-secondary">+</button>
            </div>
          </div>

          <div className="form-group row">
            <VariableInput items={this.state.db_filter} handleChange={this.handleDbFilterChange} validate={this.findParameters} label="Filter in Database" placeholder="Filter condition to be applied on a table in database"/>
            <div className="col-sm-1">
              <button type="button" onClick={this.addDbFilter} className="btn btn-outline-secondary">+</button>
            </div>
          </div>

          <div className="form-group row">
            <VariableInput items={this.state.memory_filter} handleChange={this.handleMemoryFilterChange} validate={this.findParameters} label="Filter in Memory" placeholder="Filter condition to be applied on a table in memory"/>
            <div className="col-sm-1">
              <button type="button" onClick={this.addMemoryFilter} className="btn btn-outline-secondary">+</button>
            </div>
          </div>

          <div className="form-group row">
            <VariableInput items={this.state.join} handleChange={this.handleJoinChange} validate={this.findParameters} label="Join" placeholder="Join conditions"/>
            <div className="col-sm-1">
              <button type="button" onClick={this.addJoin} className="btn btn-outline-secondary">+</button>
            </div>
          </div>

      </div>;
    } else{
      formElementCreateNew =
      <div>
      <div className="form-group row">
        <label htmlFor="select" className="col-sm-3 col-form-label">Raw query</label>
        <div className="col-sm-8">
          <textarea type="text" value={this.state.query_json} onChange={this.handleQueryJsonChange} onBlur={this.findParameters} className="form-control vresize" placeholder="Raw query in JSON structure" rows="8"></textarea>
        </div>
      </div>
    </div>;
    }

    var formElementSave;

    if(this.state.save_query){
      formElementSave =
        <div className="form-group row">
          <label htmlFor="save_query" className="col-sm-3 col-form-label">Query Name</label>
          <div className="col-sm-8">
            <input type="textarea" onChange={this.handleNewQueryNameChange} value={this.state.new_query_name} className="form-control" id="instanceName" placeholder="Query name to save against the instance"></input>
          </div>
        </div>

    } else{
      formElementSave = <div />;
    }

    var formElement;

    if(this.state.create_new){
      formElement =
      <div>
        <div className="form-group row">
          <label htmlFor="mode" className="col-sm-3 col-form-label">Guided Mode</label>
          <div className="col-sm-8 switch">
            <input id="mode_checkbox" checked={this.state.guided_mode} type="checkbox" onChange={this.handleModeChange}/>
            <label htmlFor="mode_checkbox"></label>
          </div>
        </div>

        {formElementCreateNew}

        <div className="form-group row">
          <label htmlFor="mode" className="col-sm-3 col-form-label">Save Query</label>
          <div className="col-sm-8 switch">
            <input id="save_query_checkbox" checked={this.state.save_query} type="checkbox" onChange={this.handleSaveQueryChange}/>
            <label htmlFor="save_query_checkbox"></label>
          </div>
        </div>

        {formElementSave}

      </div>;
    } else{
      formElement =
      <div>
        <div className="form-group row">
          <label htmlFor="existing_query_name" className="col-sm-3 col-form-label">Saved Queries</label>
          <div className="col-sm-8">
            <select ref="existing_query_name" onChange={this.handleExistingQueryNameChange} className="form-control" value={this.state.existing_query_name}>
             {
               this.state.saved_queries_namelist.map(function(query_name) {
                 return <option key={query_name}
                   value={query_name}>{query_name}</option>;
               })
             }
           </select>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="select" className="col-sm-3 col-form-label">Raw query</label>
          <div className="col-sm-8">
            <textarea type="text" value={this.state.existing_query} onChange={this.handleExistingQueryChange} onBlur={this.findParameters} className="form-control vresize" placeholder="Raw query in JSON structure" rows="8"></textarea>
          </div>
        </div>
      </div>;
    }


      return (
        <div>
          <Notification show={this.state.notification_show} type={this.state.notification_type} message={this.state.notification_message} />
          <div className="container">
            <div className="jumbotron2">
              <h1>Execute Query</h1>
              <br/>
            </div>
            <form>
              <div className="form-group row">
                <label htmlFor="mode" className="col-sm-3 col-form-label">Create New Query</label>
                <div className="col-sm-8 switch">
                  <input id="create_new_checkbox" checked={this.state.create_new} type="checkbox" onChange={this.handleCreateNewChange}/>
                  <label htmlFor="create_new_checkbox"></label>
                </div>
              </div>

              {formElement}

              <div className="form-group row">
                <Parameters items={this.state.parameters} handleChange={this.handleParameterChange} label="Parameters" placeholder="dynamic paramater values - comma seperated"/>
              </div>

              <div className="form-group row">
                <label htmlFor="driver" className="col-sm-3 col-form-label">Database Driver</label>
                <div className="col-sm-8">
                  <select ref="format" onChange={this.handleFormatChange} className="form-control" value={this.state.format}>
                    <option key="json" value="json">JSON</option>
                    <option key="json-flattened" value="json-flattened">Flattened JSON</option>
                    <option key="delimited" value="delimited">Delimited</option>
                  </select>
                </div>
              </div>

              <div className="form-group row">
                <div className="col-sm-3">
                </div>
                <div className="col-sm-8">
                  <button type="button" onClick={this.submit} className="btn btn-primary">Run Query</button>
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

class VariableInput extends React.Component {

  constructor(){
    super();

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(index, event){
    this.props.handleChange(event, index);
  }

  createInputItems(list) {
     var listOptions = [];
     for (var i = 0; i < list.length; i++) {
       var id = i;
       listOptions.push(<div className="vertical-space-bottom" key={i}>
       <textarea id={id} type="text" value={list[i]} onChange={this.handleChange.bind(this,i)} onBlur={this.props.validate} className="form-control vresize" key={i} placeholder={this.props.placeholder} rows="1"></textarea>
       </div>);
     }
     return listOptions;
  }

  render(){

    var listOptions = this.createInputItems(this.props.items);

    return(
      <div>
        <label htmlFor="element" className="col-sm-3 col-form-label">{this.props.label}</label>
        <div className="col-sm-8">
          {listOptions}
        </div>
      </div>
    )
  }
}


class Parameters extends React.Component {

constructor(){
  super();

  this.handleChange = this.handleChange.bind(this);
}

handleChange(index, event){
  this.props.handleChange(event, index);
}

createInputItems(list) {
   var listOptions = [];
   var keys = Object.keys(list);
   for (var i = 0; i < keys.length; i++) {
     var id = keys[i];

     listOptions.push(
      <div className="vertical-space-bottom" key={i}>
        <label htmlFor="element" className="col-sm-3 col-form-label">{id}</label>
        <div className="col-sm-8 vertical-space-bottom">
         <textarea id={id} type="text" value={list[keys[i]][keys[i]]} onChange={this.handleChange.bind(this,id)} onBlur={this.props.validate} className="form-control vresize" key={i} placeholder={this.props.placeholder} rows="1"></textarea>
        </div>
      </div>);
   }
   return listOptions;
}

render(){

  var listOptions = this.createInputItems(this.props.items);

  return(
    <div>
      <div className="container">
        <h3>{this.props.label}</h3>
        <br/>
      </div>

      <div>
        {listOptions}
      </div>
    </div>
  )
}
}

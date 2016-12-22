import React from "react";

export default class InstanceDropdown extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      items: [],
      value: selectedInstance
    }

    this.restCall();

    this.handleSuccess = this.handleSuccess.bind(this);

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {

  }

  restCall() {

    var remote_url = mirrorInstance + "demeter-core/rest/instance";

    $.ajax({
      type: "GET",
      crossDomain: true,
      url: remote_url,
      async: true,
      success: function (response) {
          this.handleSuccess(response);
      }.bind(this),
      error: function () {
          this.handleError();
      }.bind(this)
    })
  }

  handleSuccess(response){
    var json = JSON.parse(response);

    this.setState({items: json});

  }

  handleError(){
    // ReactDOM.render(<NotificationDownload />, document.getElementById("notification-download"));
  }



  onChange(index, event){

    if(index<0){
      selectedInstance="None";
    } else{
      selectedInstance = this.state.items[index];
    }

    this.setState({value: selectedInstance});

  }

  createSelectItems(list) {
     var listOptions = [<li key={-1} onClick={this.onChange.bind(this,-1)}><a>None</a></li>];
    //  var listOptions = [<option key={list.length+1}>None</option>];
     for (var i = 0; i < list.length; i++) {
       listOptions.push(<li key={i} onClick={this.onChange.bind(this,i)}><a>{list[i]}</a></li>);
      //  listOptions.push(<option key={i}>{list[i]}</option>);
     }
     return listOptions;
 }

  render(){

    var listItems = this.createSelectItems(this.state.items);

    return (
        <div className="nav navbar-nav navbar-right instance-dropdown">
          <div className="dropdown">
            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              {this.state.value}
              <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
              {listItems}
            </ul>
          </div>
      </div>
    )
  }

}

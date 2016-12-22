import React from "react";

export default class Notification extends React.Component {

  render(){

    var element = <div />;

    if(this.props.show==false){
        element = <div />;
    } else if (this.props.show==true){

      if(this.props.type=="success"){
        element =
        <div className="alert alert-success" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          {this.props.message}
        </div>
      } else if(this.props.type=="error"){
        element =
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          {this.props.message}
        </div>
      } else if(this.props.type=="warning"){
        element =
        <div className="alert alert-warning" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          {this.props.message}
        </div>
      }
    }

    return (
      <div>
        {element}
      </div>
    )
  }

}

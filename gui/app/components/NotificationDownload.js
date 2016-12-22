import React from "react";

import Notification from "./Notification";

export default class NotificationDownload extends React.Component {

  constructor(){
    super();
    this.state = {
      downloadKeys: downloadKeys
    }
  }

  closeDownloadNotification(index, event){
    downloadKeys.splice(index, 1);
    this.setState({downloadKeys: downloadKeys});
  }

  render(){

    var elements = [];

    for(var i=0; i<this.state.downloadKeys.length; i++){
      var downloadId = downloadKeys[i];
      var notification_message;
      var type;

      if(downloadId!='error'){

        var link = mirrorInstance + "demeter-core/rest/query/result/" + downloadId;

        notification_message=
        <div className="div-inline">
        &nbsp; Query executed successfully. Download Key = {downloadId} &nbsp;
        <a href={link} type="button" onClick={this.closeDownloadNotification.bind(this, i)} className="btn btn-primary button-anchor">Download Now</a>
        <a type="button" onClick={this.closeDownloadNotification.bind(this, i)} className="btn btn-primary button-anchor">Dismiss</a>
        </div>

        type="success";

      } else {

        notification_message=
        <div className="div-inline">
        &nbsp; Query execution failed &nbsp;
        <a type="button" onClick={this.closeDownloadNotification.bind(this, i)} className="btn btn-primary button-anchor">Dismiss</a>
        </div>

        type="error";

      }

      elements.push(
        <Notification key={i} show={true} message={notification_message} type={type} />
      )
    }

    return (
      <div>
        {elements}
      </div>
    )
  }

}

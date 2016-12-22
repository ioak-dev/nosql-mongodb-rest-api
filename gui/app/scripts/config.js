selectedInstance="None";
mirrorInstance="http://localhost:8080/";
downloadKeys=[];
drivers=[];

function getDrivers(){
  var remote_url = mirrorInstance + "demeter-core/rest/property/global";

  $.ajax({
      type: "GET",
      url: remote_url,
      async: true,
      crossDomain: true,
      success: function (response) {
        parseDrivers(response);
      }.bind(this),
      error: function (outcome) {
        drivers = [];
      }.bind(this)
  })
}

function parseDrivers(response){
    var responseJson = JSON.parse(response);
    if(responseJson.hasOwnProperty('database-driver')){
      var driver = responseJson['database-driver'];
      drivers = Object.keys(driver);
    }
}

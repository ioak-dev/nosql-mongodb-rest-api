const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

app.on('ready', function(){
  var mainWindow = new BrowserWindow({
    width:800,
    height:600
  })

  mainWindow.loadURL('file://' + __dirname + '/index.html')
})

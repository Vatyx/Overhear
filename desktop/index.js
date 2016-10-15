const {app, BrowserWindow} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {

	// var subpy = require('child_process').spawn('python', ['../audio_capture/audio_capture.py']);
	var subpy = require('child_process').spawn('python', ['../audio_capture/hello.py']);

	// Create the browser window.
	win = new BrowserWindow({width: 800, height: 600});

	// and load the index.html of the app.
	win.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/*
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
electron.crashReporter.start();

var mainWindow = null;

app.on('window-all-closed', function() {
  //if (process.platform != 'darwin') {
    app.quit();
  //}
});

app.on('ready', function() {
  // call python?
  var subpy = require('child_process').spawn('python', ['./hello.py']);
  //var subpy = require('child_process').spawn('./dist/hello.exe');
  var rq = require('request-promise');
  var mainAddr = 'http://localhost:5000';

  var openWindow = function(){
    mainWindow = new BrowserWindow({width: 800, height: 600});
    // mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function() {
      mainWindow = null;
      subpy.kill('SIGINT');
    });
  };

  var startUp = function(){
    rq(mainAddr)
      .then(function(htmlString){
        console.log('server started!');
        openWindow();
      })
      .catch(function(err){
        //console.log('waiting for the server start...');
        startUp();
      });
  };

  // fire!
  startUp();
});
*/

//parse arguments passed from command line (or more likely, from rails)
var system = require('system');
var args = system.args;
if (args.length <= 1) {
  phantom.exit();
  throw new Error("no arguments supplied on command line");
}//if

//configurable variables - CHANGE ME
var mapID = args[1];
var url = 'http://localhost:3000/maps/' + mapID;
var width = 400;
var height = 400;
var thumbsDirRelative = 'app/assets/images/map_thumbnails';

//set up writing to filesystem
var fs = require('fs');
var thumbsDirectory = fs.workingDirectory + '/' + thumbsDirRelative; 
if (!fs.isDirectory(thumbsDirectory)) {
  fs.makeDirectory(thumbsDirectory);
}//if

//set up page and the area we'll render as a PNG
var page = require('webpage').create();
page.viewportSize = {
  width: width,
  height: height
};
page.clipRect = {
  top: 32,
  left: 32,
  width: width - 32,
  height: height - 32
};
page.open(url, function (status) {
  if (status === 'success') {
    //since this isn't evaluateAsync, it should also ensure the asynchronous
    //js stuff is loaded too, hopefully?
    page.evaluate(function() {
      $(document).ready(function(){
        $('.upperLeftUI, .upperRightUI, .mapControls, .infoAndHelp, #barometer_tab, .footer').hide();
      });//document.ready
    });//page.evaluate

    //render page into map_thumbnails directory
    var filename = thumbsDirectory + '/map' + mapID + '.png';
    page.render(filename, 'PNG');

  } else {
    //failed to load
  }//if

  phantom.exit();
});

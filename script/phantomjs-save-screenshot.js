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
var width = 188;
var height = 126;

//set up page and the area we'll render as a PNG
var page = require('webpage').create();
page.viewportSize = {
  width: width,
  height: height
};

page.open(url, function (status) {
  if (status === 'success') {
    //since this isn't evaluateAsync, it should also ensure the asynchronous
    //js stuff is loaded too, hopefully?
    page.evaluate(function() {
      $(document).on(Metamaps.JIT.events.animationDone, function(){
        $('.upperLeftUI, .upperRightUI, .mapControls, .infoAndHelp, #barometer_tab').hide();
        Metamaps.Famous.logo.hide() 
        Metamaps.JIT.zoomExtents();
        console.log('got here');
      });//document.on animationDone
    });//page.evaluate

    //pass to ruby
    //console.log(page.renderBase64('PNG'));
    
    //render to the metamaps_gen002 directory for debug
    page.render('map1.png', 'PNG');

  } else {
    //failed to load
  }//if

  setTimeout(phantom.exit,5000);
  //phantom.exit();
});

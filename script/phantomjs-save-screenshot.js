//parse arguments passed from command line (or more likely, from rails)
var system = require('system');
var args = system.args;
if (args.length <= 1) {
  phantom.exit();
  throw new Error("no arguments supplied on command line");
}//if

//configurable variables - CHANGE ME
var mapID = args[1];
var url = 'http://metamaps.herokuapp.com/maps/' + mapID;
var width = 940;
var height = 630;

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

    page.onCallback = function(data){
      
      //pass to ruby
      console.log(page.renderBase64('PNG'));

      //render to the metamaps_gen002 directory for debug
      //page.render('map1.png', 'PNG');
      
      phantom.exit();
    };

    page.evaluate(function() {
      $(document).on(Metamaps.JIT.events.animationDone, function(){
        $('.upperLeftUI, .upperRightUI, .mapControls, .infoAndHelp, .uv-icon, .footer').hide();
        Metamaps.JIT.zoomExtents();
        if (typeof window.callPhantom === 'function') {
          window.callPhantom();
        }
      });//document.on animationDone
    });//page.evaluate
  } else {
    //failed to load
  }//if
});

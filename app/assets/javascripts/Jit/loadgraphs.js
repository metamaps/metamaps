(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

// init custom node type 
$jit.ForceDirected.Plot.NodeTypes.implement(nodeSettings);
//implement an edge type  
$jit.ForceDirected.Plot.EdgeTypes.implement(edgeSettings);
$jit.ForceDirected.Plot.EdgeTypes.implement(edgeSettingsEmbed);
// end

// init custom node type 
$jit.RGraph.Plot.NodeTypes.implement(nodeSettings);
//implement an edge type  
$jit.RGraph.Plot.EdgeTypes.implement(edgeSettings);
// end

function initialize(type, loadLater, embed){

  if (loadLater == null) {
	   loadlater = false;
  }
  if (embed == null) {
	   embed = false;
  }

  viewMode = "graph";
  gType = type;
  
  if ( type == "centered") {
	  // init Rgraph
	 Mconsole = new $jit.RGraph(graphSettings(type));
  }
  else if ( type == "arranged" || type == "chaotic" ) {
	  // init ForceDirected
	 Mconsole = new $jit.ForceDirected(graphSettings(type, embed));
  }
  else {
	 alert("You didn't specify a type!"); 
	 return false;
  }
  
  // load JSON data.
  if (!loadLater) {
      Mconsole.busy = true;
  	  Mconsole.loadJSON(json);
	  
	  // choose how to plot and animate the data onto the screen
	  var chooseAnimate;
	  
	  if ( type == "centered") {
		  // compute positions incrementally and animate.
		  //trigger small animation  
		  Mconsole.graph.eachNode(function(n) {  
			var pos = n.getPos();  
			pos.setc(-200, -200);  
		  });  
		  Mconsole.compute('end');
		  
		  chooseAnimate = {  
			modes:['polar'],  
			duration: 2000,
      onComplete: function() {
         Mconsole.busy = false;
       }
		  };
	  }
	  else if ( type == "arranged" ) {
		  // compute positions incrementally and animate.
		  Mconsole.graph.eachNode(function(n) {  
			var pos = n.getPos();  
			pos.setc(0, 0); 
			var newPos = new $jit.Complex(); 
			newPos.x = n.data.$xloc; 
			newPos.y = n.data.$yloc; 
			n.setPos(newPos, 'end');
		  });
		  
		  chooseAnimate = {
			 modes: ['linear'],
			 transition: $jit.Trans.Quad.easeInOut,
			 duration: 2500,
       onComplete: function() {
         Mconsole.busy = false;
        }
		   };
	  }
	  else if ( type == "chaotic" ) {
		  // compute positions incrementally and animate.
		  Mconsole.compute();
		  
		  chooseAnimate = {
			 modes: ['linear'],
			 transition: $jit.Trans.Elastic.easeOut,
			 duration: 2500,
       onComplete: function() {
         Mconsole.busy = false;
        }
		   };
	  }
	  
	
	  $(document).ready(function() {
		if ( type == "centered") {
			Mconsole.fx.animate(chooseAnimate);
		}
		else if ( type == "arranged" || type == "chaotic") {
			Mconsole.animate(chooseAnimate);
		}
          
         // prevent touch events on the canvas from default behaviour
        $("#infovis-canvas").bind('touchstart', function(event) {
          event.preventDefault();
          Mconsole.events.touched = true;
        });
         
         // prevent touch events on the canvas from default behaviour
        $("#infovis-canvas").bind('touchmove', function(event) {
          //touchPanZoomHandler(event);
        });
         
         // prevent touch events on the canvas from default behaviour
        $("#infovis-canvas").bind('touchend touchcancel', function(event) {
          lastDist = 0;
          if (!Mconsole.events.touchMoved && !touchDragNode) hideCurrentCard();
          Mconsole.events.touched = Mconsole.events.touchMoved = false;
          touchDragNode = false;
        });
	  });
	  // end
  }// if not loadLater
}

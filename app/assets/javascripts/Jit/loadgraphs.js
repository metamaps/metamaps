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

var imgArray = new Object();

imgArray['Group'] = new Image(); imgArray['Group'].src = '/assets/group.png';
imgArray['Person'] = new Image(); imgArray['Person'].src = '/assets/person.png';
imgArray['Bizarre'] = new Image(); imgArray['Bizarre'].src = '/assets/bizarre.png';
imgArray['Catalyst'] = new Image(); imgArray['Catalyst'].src = '/assets/catalyst.png';
imgArray['Closed'] = new Image(); imgArray['Closed'].src = '/assets/closed.png';
imgArray['Experience'] = new Image(); imgArray['Experience'].src = '/assets/experience.png';
imgArray['Future Dev'] = new Image(); imgArray['Future Dev'].src = '/assets/futuredev.png';
imgArray['Idea'] = new Image(); imgArray['Idea'].src = '/assets/idea.png';
imgArray['Implication'] = new Image(); imgArray['Implication'].src = '/assets/implication.png';
imgArray['Insight'] = new Image(); imgArray['Insight'].src = '/assets/insight.png';
imgArray['Intention'] = new Image(); imgArray['Intention'].src = '/assets/intention.png';
imgArray['Knowledge'] = new Image(); imgArray['Knowledge'].src = '/assets/knowledge.png';
imgArray['Location'] = new Image(); imgArray['Location'].src = '/assets/location.png';
imgArray['Open Issue'] = new Image(); imgArray['Open Issue'].src = '/assets/openissue.png';
imgArray['Opinion'] = new Image(); imgArray['Opinion'].src = '/assets/opinion.png';
imgArray['Opportunity'] = new Image(); imgArray['Opportunity'].src = '/assets/opportunity.png';
imgArray['Platform'] = new Image(); imgArray['Platform'].src = '/assets/platform.png';
imgArray['Problem'] = new Image(); imgArray['Problem'].src = '/assets/problem.png';
imgArray['Question'] = new Image(); imgArray['Question'].src = '/assets/question.png';
imgArray['Reference'] = new Image(); imgArray['Reference'].src = '/assets/reference.png';
imgArray['Requirement'] = new Image(); imgArray['Requirement'].src = '/assets/requirement.png';
imgArray['Resource'] = new Image(); imgArray['Resource'].src = '/assets/resource.png';
imgArray['Role'] = new Image(); imgArray['Role'].src = '/assets/role.png';
imgArray['Task'] = new Image(); imgArray['Task'].src = '/assets/task.png';
imgArray['Tool'] = new Image(); imgArray['Tool'].src = '/assets/tool.png';
imgArray['Trajectory'] = new Image(); imgArray['Trajectory'].src = '/assets/trajectory.png';
imgArray['Action'] = new Image(); imgArray['Action'].src = '/assets/action.png';
imgArray['Activity'] = new Image(); imgArray['Activity'].src = '/assets/activity.png';


// init custom node type 
$jit.ForceDirected.Plot.NodeTypes.implement(nodeSettings);
//implement an edge type  
$jit.ForceDirected.Plot.EdgeTypes.implement(edgeSettings);
// end

// init custom node type 
$jit.RGraph.Plot.NodeTypes.implement(nodeSettings);
//implement an edge type  
$jit.RGraph.Plot.EdgeTypes.implement(edgeSettings);
// end

function initialize(type, loadLater){

  if (loadLater == null) {
	   loadlater = false;
  }

  viewMode = "graph";
  gType = type;
  
  if ( type == "centered") {
	  // init Rgraph
	 Mconsole = new $jit.RGraph(graphSettings(type));
  }
  else if ( type == "arranged" || type == "chaotic" ) {
	  // init ForceDirected
	 Mconsole = new $jit.ForceDirected(graphSettings(type));
  }
  else {
	 alert("You didn't specify a type!"); 
	 return false;
  }
  
  // load JSON data.
  if (!loadLater) {
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
			duration: 2000  
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
			 duration: 2500
		   };
	  }
	  else if ( type == "chaotic" ) {
		  // compute positions incrementally and animate.
		  Mconsole.compute();
		  
		  chooseAnimate = {
			 modes: ['linear'],
			 transition: $jit.Trans.Elastic.easeOut,
			 duration: 2500
		   };
	  }
	  
	
	  $(document).ready(function() {
		if ( type == "centered") {
			Mconsole.fx.animate(chooseAnimate);
		}
		else if ( type == "arranged" || type == "chaotic") {
			Mconsole.animate(chooseAnimate);
		}
	  });
	  // end
  }// if not loadLater
}

var labelType, useGradients, nativeTextSupport, animate, json, console, gType;

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

function initialize(type){
  gType = type;
  
  // init custom node type 
  $jit.ForceDirected.Plot.NodeTypes.implement({  
	  'customNode': {  
		  'render': function (node, canvas) {		  			  
			  var pos = node.pos.getc(true),
			  dim = node.getData('dim'),
			  cat = node.getData('itemcatname'),
			  ctx = canvas.getCtx();
			  ctx.drawImage(imgArray[cat], pos.x - dim, pos.y - dim, dim*2, dim*2);

		  },
		  'contains': function(node, pos) {
			var npos = node.pos.getc(true), 
			dim = node.getData('dim');
			return this.nodeHelper.circle.contains(npos, pos, dim);
		  }
	  }
  });
  //implement an edge type  
	$jit.ForceDirected.Plot.EdgeTypes.implement({  
	  'customEdge': {  
		'render': function(adj, canvas) {  
		  //get nodes cartesian coordinates 
		  var pos = adj.nodeFrom.pos.getc(true); 
		  var posChild = adj.nodeTo.pos.getc(true);
		  
		  var directionCat = adj.getData("category");
		  //label placement on edges 
		  //plot arrow edge 
		  if (directionCat == "none") {
				this.edgeHelper.line.render({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, canvas);
		  }
		  else if (directionCat == "both") {
				this.edgeHelper.arrow.render({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 40, false, canvas);
				this.edgeHelper.arrow.render({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 40, true, canvas);
		  }
		  else if (directionCat == "from-to") {
			  	var direction = adj.data.$direction;
				var inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id);
				this.edgeHelper.arrow.render({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 40, inv, canvas);
		  }
		   
		  //check for edge label in data  
		  var desc = adj.getData("desc") + ' (' + adj.getData("userid") + ',' + adj.getData("id") + ')';
		  var showDesc = adj.getData("showDesc");
		  if( desc != "" && showDesc ) { 
			 //now adjust the label placement 
			var radius = canvas.getSize(); 
			var x = parseInt((pos.x + posChild.x - (desc.length * 5)) /2); 
			var y = parseInt((pos.y + posChild.y) /2); 
			canvas.getCtx().fillStyle = '#000';
			canvas.getCtx().font = 'bold 14px arial';
			//canvas.getCtx().fillText(desc, x, y); 
		  }
		}  
	  }  
	});
  // end
  
  
  if ( type == "centered") {
	 console = new $jit.RGraph(graphSettings(type));
  }
  else if ( type == "arranged" || type == "chaotic" ) {
	  // init ForceDirected
	 console = new $jit.ForceDirected(graphSettings(type));
  }
  else {
	 alert("You didn't specify a type!"); 
	 return false;
  }
  
  // load JSON data.
  console.loadJSON(json);
  
  // choose how to plot and animate the data onto the screen
  var chooseAnimate;
  
  if ( type == "centered") {
	  // compute positions incrementally and animate.
	  //trigger small animation  
	  console.graph.eachNode(function(n) {  
		var pos = n.getPos();  
		pos.setc(-200, -200);  
	  });  
	  console.compute('end');
	  
	  chooseAnimate = {  
		modes:['polar'],  
		duration: 2000  
	  };
  }
  else if ( type == "arranged" ) {
	  // compute positions incrementally and animate.
	  console.graph.eachNode(function(n) {  
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
      console.compute()
	  
	  chooseAnimate = {
         modes: ['linear'],
         transition: $jit.Trans.Elastic.easeOut,
         duration: 2500
       };
  }
  

  $(document).ready(function() {
	if ( type == "centered") {
		console.fx.animate(chooseAnimate);
	}
	else if ( type == "arranged" || type == "chaotic") {
		console.animate(chooseAnimate);
	}
  });
  // end
}

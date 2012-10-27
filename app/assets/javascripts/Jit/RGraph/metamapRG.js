var labelType, useGradients, nativeTextSupport, animate, json, rg;

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

function initRG(){
  // init custom node type 
  $jit.RGraph.Plot.NodeTypes.implement({  
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
  // end
  // init RGraph
    rg = new $jit.RGraph({
    //id of the visualization container
    injectInto: 'infovis',
	//Optional: create a background canvas that plots  
    //concentric circles.  
    background: {  
      CanvasStyles: {  
        strokeStyle: '#555'  
      }  
    },
    //Enable zooming and panning
    //by scrolling and DnD
    Navigation: {
      enable: true,
	  type: 'HTML',
      //Enable panning events only if we're dragging the empty
      //canvas (and not a node).
      panning: 'avoid nodes',
      zooming: 10 //zoom speed. higher is more sensible
    },
    // Change node and edge styles such as
    // color and width.
    // These properties are also set per node
    // with dollar prefixed data-properties in the
    // JSON structure.
    Node: {
      overridable: true,
	  color: '#2D6A5D',
	  type: 'customNode',
	  dim: 25
    },
    Edge: {
      overridable: true,
      color: '#222222',
      lineWidth: 0.5
    },
    //Native canvas text styling
    Label: {
      type: 'HTML', //Native or HTML
      size: 20,
      //style: 'bold'
    },
    //Add Tips
    Tips: {
      enable: true,
      onShow: function(tip, node) {
        //count connections
        var count = 0;
        node.eachAdjacency(function() { count++; });
        //display node info in tooltip
        tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"
          + "<div class=\"tip-text\">connections: " + count + "</div>";
      }
    },
    // Add node events
    Events: {
      enable: true,
	  type: 'HTML',
      //Change cursor style when hovering a node
      onMouseEnter: function() {
        //rg.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        //rg.canvas.getElement().style.cursor = '';
      },
      //Update node positions when dragged
      onDragMove: function(node, eventInfo, e) {
          var pos = eventInfo.getPos();
          node.pos.setc(pos.x, pos.y);
          rg.plot();
      },
      //Implement the same handler for touchscreens
      onTouchMove: function(node, eventInfo, e) {
        $jit.util.event.stop(e); //stop default touchmove event
        this.onDragMove(node, eventInfo, e);
      },
      //Add also a click handler to nodes
      onClick: function(node) {
        if(!node) return;
		//set final styles  
		  rg.graph.eachNode(function(n) {  
			if(n.id != node.id) delete n.selected;  
			n.setData('dim', 25, 'end');  
			n.eachAdjacency(function(adj) {  
			  adj.setDataset('end', {  
				lineWidth: 0.5,  
				color: '#222222'  
			  });  
			});  
		  });  
		  if(!node.selected) {  
			node.selected = true;  
			node.setData('dim', 35, 'end');  
			node.eachAdjacency(function(adj) {  
			  adj.setDataset('end', {  
				lineWidth: 3,  
				color: '#FFF'  
			  });  
			});  
		  } else {  
			delete node.selected;  
		  }  
		  //trigger animation to final styles  
		  rg.fx.animate({  
			modes: ['node-property:dim',  
					'edge-property:lineWidth:color'],  
			duration: 500  
		  });
        // Build the right column relations list.
        // This is done by traversing the clicked node connections.
        var html = 
          '<p class="type">' + node.getData("itemcatname") + '</p>' + 
           '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
           '<a href="/users/' + node.getData("userid") + '/items/' + node.id + '" class="title">' + node.name + '</a>' + 
		   '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' + 
           '<div class="desc"><p>' + node.getData('desc') + '</p></div>' +
           '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a>';

        //append connections information
        $jit.id('showcard').innerHTML = '<div class="item" id="item_' + node.id + '"></div>';
        $jit.id('item_' + node.id).innerHTML = html;
      }
    },
    //Number of iterations for the rg algorithm
    iterations: 200,
    //Edge length
    levelDistance: 150,
    // Add text to the labels. This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    onCreateLabel: function(domElement, node){  
		// Create a 'name' and 'close' buttons and add them  
		// to the main node label  
			domElement.innerHTML = '<div class="label">' + node.name + '</div>';  
			domElement.onclick = function(){  
				rg.onClick(node.id, {  
					onComplete: function() {  
						var html = 
						  '<p class="type">' + node.getData("itemcatname") + '</p>' + 
						   '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
						   '<a href="/users/' + node.getData("userid") + '/items/' + node.id + '" class="title">' + node.name + '</a>' + 
						   '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' + 
						   '<div class="desc"><p>' + node.getData('desc') + '</p></div>' +
						   '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a>';
				
						//append connections information
						$jit.id('showcard').innerHTML = '<div class="item" id="item_' + node.id + '"></div>';
						$jit.id('item_' + node.id).innerHTML = html;
					}  
				});  
			}  
	  },  
    // Change node styles when DOM labels are placed
    // or moved.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style;
      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
	  var dim = node.getData('dim');
      style.left = (left - w / 2) + 'px';
      style.top = (top + dim) + 'px';
      style.display = '';
    }
  });
  // load JSON data.
  rg.loadJSON(json);
  // compute positions incrementally and animate.
  //trigger small animation  
  rg.graph.eachNode(function(n) {  
	var pos = n.getPos();  
	pos.setc(-200, -200);  
  });  
  rg.compute('end');  
  rg.fx.animate({  
	modes:['polar'],  
	duration: 2000  
  });
  // end
}

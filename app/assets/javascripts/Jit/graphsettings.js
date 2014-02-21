/*
 * @file
 * This function defines all settings and event callbacks for the JIT graph. Some are found in other files
 * First is the common settings (the same as arranged or chaotic)
 * Then if it's a centred graph additional settings are added.
 */

function graphSettings(type, embed) {
   var t = {
     //id of the visualization container
     injectInto: 'infovis',
     //Enable zooming and panning
     //by scrolling and DnD
     Navigation: {
       enable: true,
       //Enable panning events only if we're dragging the empty
       //canvas (and not a node).
       panning: 'avoid nodes',
       zooming: 28 //zoom speed. higher is more sensible
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
       type: 'customEdge',
       lineWidth: 2,
       alpha: 0.4
    },
    //Native canvas text styling
    Label: {
       type: 'Native', //Native or HTML
       size: 20,
       family: 'arial',
       textBaseline: 'hanging',
       color:'#DDD'
       //style: 'bold'
    },
    //Add Tips
    Tips: {
       enable: false,
       onShow: function (tip, node) {}
    },
    // Add node events
    Events: {
      enable: true,
      enableForEdges: true,
      onMouseMove: function(node, eventInfo, e) {
        onMouseMoveHandler(node, eventInfo, e);
      },
      //Update node positions when dragged
      onDragMove: function (node, eventInfo, e) {
        onDragMoveTopicHandler(node, eventInfo, e); 
      },
      onDragEnd: function(node, eventInfo, e) {
        onDragEndTopicHandler(node, eventInfo, e, false);
      },
      onDragCancel: function(node, eventInfo, e) {
        onDragCancelHandler(node, eventInfo, e, false);
      },
      //Implement the same handler for touchscreens
      onTouchStart: function (node, eventInfo, e) {
        //$jit.util.event.stop(e); //stop default touchmove event
        //Mconsole.events.onMouseDown(e, null, eventInfo);
        Mconsole.events.touched = true;
        touchPos = eventInfo.getPos();
        var canvas = Mconsole.canvas,
        ox = canvas.translateOffsetX;
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY;
        touchPos.x *= sx;
        touchPos.y *= sy;
        touchPos.x += ox;
        touchPos.y += oy;
          
        touchDragNode = node;
      },
      //Implement the same handler for touchscreens
      onTouchMove: function (node, eventInfo, e) {
        if (touchDragNode) onDragMoveTopicHandler(touchDragNode, eventInfo, e);
        else {
          touchPanZoomHandler(eventInfo, e); 
          Mconsole.labels.hideLabel(Mconsole.graph.getNode(MetamapsModel.showcardInUse));
        }
      },
      //Implement the same handler for touchscreens
      onTouchEnd: function (node, eventInfo, e) {
        
      },
      //Implement the same handler for touchscreens
      onTouchCancel: function (node, eventInfo, e) {
        
      },
      //Add also a click handler to nodes
      onClick: function (node, eventInfo, e) {
        if (MetamapsModel.boxStartCoordinates) {
          Mconsole.busy = false;
          MetamapsModel.boxEndCoordinates = eventInfo.getPos();
          selectNodesWithBox();
          return;
        }
        
        if (e.target.id != "infovis-canvas") return false;

        //clicking on a edge, node, or clicking on blank part of canvas?
        if (node.nodeFrom) {
          selectEdgeOnClickHandler(node, e);  
        } else if (node && !node.nodeFrom) {
          selectNodeOnClickHandler(node, e);
        } else {
          //topic and synapse editing cards
          if (!MetamapsModel.didPan) {
            hideCards();
          }
          canvasDoubleClickHandler(eventInfo.getPos(), e);
        }//if
      },
      onRightClick: function (node, eventInfo, e) {
        e.preventDefault();
        e.stopPropagation();
      
        if (node && !node.nodeFrom) { 
          selectNodeOnRightClickHandler(node, e);
        }
        else if (node && node.nodeFrom) { // the variable 'node' is actually an edge/adjacency
          // open right click menu
          selectEdgeOnRightClickHandler(node, e);
        }
        else {
          // right click on open canvas, options here?
        }
      }
    },
    //Number of iterations for the FD algorithm
    iterations: 200,
    //Edge length
    levelDistance: 200,
    // Add text to the labels. This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    //onCreateLabel: function (domElement, node) {
     // onCreateLabelHandler(type, domElement, node);
    //},
    // Change node styles when DOM labels are placed or moved.
    //onPlaceLabel: function (domElement, node) {
    //  onPlaceLabelHandler(domElement, node);
    //}
  };

  if (embed) {
    t.Edge.type = 'customEdgeEmbed';
  }
  
  if (type == "centered") {
    t.background  = {
      CanvasStyles: {
        strokeStyle: '#333',
        lineWidth: 1.5
      }
    };
    t.levelDistance = 400;
    t.Events.enableForEdges = true;
    t.Events.onDragEnd = function(node, eventInfo, e) {
      //different because we can't go realtime
      onDragEndTopicHandler(node, eventInfo, e, false);
    };
    t.Events.onDragCancel = function(node, eventInfo, e) {
      //different because we're centred
      onDragCancelHandler(node, eventInfo, e, true);
    };
    /*t.Events.onClick = function(node, eventInfo, e) {
      //this is handled mostly differently than in arranged/chaotic
      if (e.target.id != "infovis-canvas") return false;

      //hide synapse and topic editing dialog
      hideCards();

      //clicking on an edge, a node, or clicking on blank part of canvas?
      if (node.nodeFrom) {
          selectEdgeOnClickHandler(node, e);  
      } else if (node && !node.nodeFrom) {
        //node is actually a node :)
        selectNodeOnClickHandler(node, e);
        
      } else {
        canvasDoubleClickHandler(eventInfo.getPos(), e);
      }
    };*/
  }//if

  return t;
}//graphSettings

function hideCards() {
  $('#edit_synapse').hide();
  MetamapsModel.edgecardInUse = null;
  hideCurrentCard();
  // delete right click menu
  $('.rightclickmenu').remove();
}

// defining code to draw edges with arrows pointing in one direction
var renderMidArrow = function(from, to, dim, swap, canvas, placement, newSynapse){ 
        var ctx = canvas.getCtx(); 
        // invert edge direction 
        if (swap) { 
              var tmp = from; 
              from = to; 
              to = tmp; 
        } 
        // vect represents a line from tip to tail of the arrow 
        var vect = new $jit.Complex(to.x - from.x, to.y - from.y); 
        // scale it 
        vect.$scale(dim / vect.norm()); 
        // compute the midpoint of the edge line 
        var newX = (to.x - from.x) * placement + from.x;
        var newY = (to.y - from.y) * placement + from.y;
        var midPoint = new $jit.Complex(newX, newY); 
        
        // move midpoint by half the "length" of the arrow so the arrow is centered on the midpoint 
        var arrowPoint = new $jit.Complex((vect.x / 0.7) + midPoint.x, (vect.y / 0.7) + midPoint.y);
        // compute the tail intersection point with the edge line 
        var intermediatePoint = new $jit.Complex(arrowPoint.x - vect.x, arrowPoint.y - vect.y); 
        // vector perpendicular to vect 
        var normal = new $jit.Complex(-vect.y / 2, vect.x / 2); 
        var v1 = intermediatePoint.add(normal); 
        var v2 = intermediatePoint.$add(normal.$scale(-1)); 
        
        if (newSynapse) {
          ctx.strokeStyle = "#222222";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.4;
        }
        ctx.beginPath(); 
        ctx.moveTo(from.x, from.y); 
        ctx.lineTo(to.x, to.y); 
        ctx.stroke(); 
        ctx.beginPath(); 
        ctx.moveTo(v1.x, v1.y); 
        ctx.lineTo(arrowPoint.x, arrowPoint.y); 
        ctx.lineTo(v2.x, v2.y); 
        ctx.stroke(); 
};

// defining custom node type	
var nodeSettings = {
	  'customNode': {  
		  'render': function (node, canvas) {		  			  
			  var pos = node.pos.getc(true),
			  dim = node.getData('dim'),
			  cat = node.getData('metacode'),
			  greenCircle = node.getData('greenCircle'),
			  whiteCircle = node.getData('whiteCircle'),
			  ctx = canvas.getCtx();
			  
			  // if the topic is from the Commons draw a green circle around it
			  if (greenCircle) {
				  ctx.beginPath();
				  ctx.arc(pos.x, pos.y, dim+3, 0, 2 * Math.PI, false);
				  ctx.strokeStyle = '#67be5f'; // green
				  ctx.lineWidth = 2;
				  ctx.stroke();
			  }
			  // if the topic is on the Canvas draw a white circle around it
			  if (whiteCircle) {
				  ctx.beginPath();
				  ctx.arc(pos.x, pos.y, dim+3, 0, 2 * Math.PI, false);
          if (! MetamapsModel.embed) ctx.strokeStyle = 'white';
          if (MetamapsModel.embed) ctx.strokeStyle = '#999';
				  ctx.lineWidth = 2;
				  ctx.stroke();
			  }
			  ctx.drawImage(imgArray[cat], pos.x - dim, pos.y - dim, dim*2, dim*2);

		  },
		  'contains': function(node, pos) {
			var npos = node.pos.getc(true), 
			dim = node.getData('dim');
			return this.nodeHelper.circle.contains(npos, pos, dim);
		  }
	  }
  }
  
  var renderEdgeArrows = function(edgeHelper, adj) {
    var canvas = Mconsole.canvas;
    var directionCat = adj.getData('category');
    var direction = adj.getData('direction');
    var pos = adj.nodeFrom.pos.getc(true); 
    var posChild = adj.nodeTo.pos.getc(true);

    //plot arrow edge 
    if (directionCat == "none") {
      edgeHelper.line.render({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, canvas);
    }
    else if (directionCat == "both") {
      renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, true, canvas, 0.7);
      renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, false, canvas, 0.7);
    }
    else if (directionCat == "from-to") {
      var direction = adj.data.$direction;
      var inv = (direction && direction.length > 1 && direction[0] != adj.nodeFrom.id);
      renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, inv, canvas, 0.7);
      renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, inv, canvas, 0.3);
    }
  }//renderEdgeArrow

// defining custom edges
 var edgeSettings = {  
	  'customEdge': {  
		'render': function(adj, canvas) {  
		  //get nodes cartesian coordinates 
		  var pos = adj.nodeFrom.pos.getc(true); 
		  var posChild = adj.nodeTo.pos.getc(true);
		  
		  var directionCat = adj.getData("category");
		  //label placement on edges 
          renderEdgeArrows(this.edgeHelper, adj);
		   
		  //check for edge label in data  
		  var desc = adj.getData("desc");
		  var showDesc = adj.getData("showDesc");
		  if( desc != "" && showDesc ) { 
            // '&amp;' to '&'
            desc = decodeEntities(desc);

            //now adjust the label placement 
            var ctx = canvas.getCtx();
			var radius = canvas.getSize(); 
			var x = parseInt((pos.x + posChild.x - (desc.length * 5)) /2); 
			var y = parseInt((pos.y + posChild.y) /2); 
			ctx.font = 'bold 14px arial';

            //render background
            ctx.fillStyle = '#FFF';
            var margin = 5;
            var height = 14 + margin; //font size + margin
            var CURVE = height / 2; //offset for curvy corners
            var width = ctx.measureText(desc).width + 2 * margin - 2 * CURVE
            var labelX = x - margin + CURVE;
            var labelY = y - height + margin;
            ctx.fillRect(labelX, labelY, width, height);

            //curvy corners woo - circles in place of last CURVE pixels of rect
            ctx.beginPath();
            ctx.arc(labelX, labelY + CURVE, CURVE, 0, 2 * Math.PI, false);
            ctx.arc(labelX + width, labelY + CURVE, CURVE, 0, 2 * Math.PI, false);
            ctx.fill();
            
            //render text
			ctx.fillStyle = '#000';
			ctx.fillText(desc, x, y); 
		  }
		}, 'contains' : function(adj, pos) { 
				var from = adj.nodeFrom.pos.getc(true), 
				 to = adj.nodeTo.pos.getc(true);
				return this.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon); 
		}  
	  }  
	}
  
  var edgeSettingsEmbed = {  
	  'customEdgeEmbed': {  
		'render': function(adj, canvas) {  
		  //get nodes cartesian coordinates 
		  var pos = adj.nodeFrom.pos.getc(true); 
		  var posChild = adj.nodeTo.pos.getc(true);
		  
		  var directionCat = adj.getData("category");
		  //label placement on edges 
          renderEdgeArrows(this.edgeHelper, adj);
		   
		  //check for edge label in data  
		  var desc = adj.getData("desc");
		  var showDesc = adj.getData("showDesc");
		  if( desc != "" && showDesc ) { 
            // '&amp;' to '&'
            desc = decodeEntities(desc);

            //now adjust the label placement 
            var ctx = canvas.getCtx();
			var radius = canvas.getSize(); 
			var x = parseInt((pos.x + posChild.x - (desc.length * 5)) /2); 
			var y = parseInt((pos.y + posChild.y) /2); 
			ctx.font = 'bold 14px arial';

            //render background
            ctx.fillStyle = '#999';
            var margin = 5;
            var height = 14 + margin; //font size + margin
            var CURVE = height / 2; //offset for curvy corners
            var width = ctx.measureText(desc).width + 2 * margin - 2 * CURVE
            var labelX = x - margin + CURVE;
            var labelY = y - height + margin;
            ctx.fillRect(labelX, labelY, width, height);

            //curvy corners woo - circles in place of last CURVE pixels of rect
            ctx.beginPath();
            ctx.arc(labelX, labelY + CURVE, CURVE, 0, 2 * Math.PI, false);
            ctx.arc(labelX + width, labelY + CURVE, CURVE, 0, 2 * Math.PI, false);
            ctx.fill();
            
            //render text
			ctx.fillStyle = '#000';
			ctx.fillText(desc, x, y); 
		  }
		}, 'contains' : function(adj, pos) { 
				var from = adj.nodeFrom.pos.getc(true), 
				 to = adj.nodeTo.pos.getc(true);
				return this.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon); 
		}  
	  }  
	}

function drawSelectBox(eventInfo, e) {
  Mconsole.plot();
  var ctx=Mconsole.canvas.getCtx();
  
  var startX = MetamapsModel.boxStartCoordinates.x,
      startY = MetamapsModel.boxStartCoordinates.y,
      currX = eventInfo.getPos().x,
      currY = eventInfo.getPos().y;
  
  Mconsole.plot();
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX, currY);
  ctx.lineTo(currX, currY);
  ctx.lineTo(currX, startY);
  ctx.lineTo(startX, startY);
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function selectNodesWithBox() {
  
  var sX = MetamapsModel.boxStartCoordinates.x,
      sY = MetamapsModel.boxStartCoordinates.y,
      eX = MetamapsModel.boxEndCoordinates.x,
      eY = MetamapsModel.boxEndCoordinates.y;
  
  
  Mconsole.graph.eachNode(function (n) {
		var x = gType == "centered" ? n.pos.toComplex().x : n.pos.x, 
        y = gType == "centered" ? n.pos.toComplex().y : n.pos.y;
    
    if ((sX < x && x < eX && sY < y && y < eY) || (sX > x && x > eX && sY > y && y > eY) || (sX > x && x > eX && sY < y && y < eY) || (sX < x && x < eX && sY > y && y > eY)) {
      var nodeIsSelected = MetamapsModel.selectedNodes.indexOf(n);
      if (nodeIsSelected == -1) selectNode(n); // the node is not selected, so select it
      else if (nodeIsSelected != -1) deselectNode(n); // the node is selected, so deselect it
      
    }
  });

  MetamapsModel.boxStartCoordinates = false;
  MetamapsModel.boxEndCoordinates = false;
  Mconsole.plot();
}

function onMouseMoveHandler(node, eventInfo, e) {
  
  if (Mconsole.busy) return;

  var node = eventInfo.getNode();
  var edge = eventInfo.getEdge();
  
  //if we're on top of a node object, act like there aren't edges under it
  if (node != false) {
    if (MetamapsModel.edgeHoveringOver) {
      onMouseLeave(MetamapsModel.edgeHoveringOver);
    }
    return;
  }

  if (edge == false && MetamapsModel.edgeHoveringOver != false) {
    //mouse not on an edge, but we were on an edge previously
    onMouseLeave(MetamapsModel.edgeHoveringOver);
  } else if (edge != false && MetamapsModel.edgeHoveringOver == false) {
    //mouse is on an edge, but there isn't a stored edge
    onMouseEnter(edge);
  } else if (edge != false && MetamapsModel.edgeHoveringOver != edge) {
    //mouse is on an edge, but a different edge is stored
    onMouseLeave(MetamapsModel.edgeHoveringOver)
    onMouseEnter(edge);
  }

  //could be false
  MetamapsModel.edgeHoveringOver = edge;
}

function onMouseEnter(edge) {
  $('canvas').css('cursor', 'pointer');
  var edgeIsSelected = MetamapsModel.selectedEdges.indexOf(edge);
  //following if statement only executes if the edge being hovered over is not selected
  if (edgeIsSelected == -1) {
    edge.setData('showDesc', true, 'current');
    edge.setDataset('end', {
        lineWidth: 4,
        alpha: 1
    });
    Mconsole.fx.animate({
      modes: ['edge-property:lineWidth:color:alpha'],
      duration: 100
    });
    Mconsole.plot();
  }
}

function onMouseLeave(edge) {
  $('canvas').css('cursor', 'default');
  var edgeIsSelected = MetamapsModel.selectedEdges.indexOf(edge);
  //following if statement only executes if the edge being hovered over is not selected
  if (edgeIsSelected == -1) {
    edge.setData('showDesc', false, 'current');
    edge.setDataset('end', {
      lineWidth: 2,
      alpha: 0.4
    });
    Mconsole.fx.animate({
      modes: ['edge-property:lineWidth:color:alpha'],
      duration: 100
    });
  }
  Mconsole.plot();
}
 
// this is for hiding one topic from your canvas
function onDragEndTopicHandler(node, eventInfo, e, allowRealtime) {
  if (tempInit && tempNode2 == null) {
    $('#topic_addSynapse').val("true");
    $('#new_topic').fadeIn('fast');
    $('#topic_name').focus();
  } else if (tempInit && tempNode2 != null) {
    $('#topic_addSynapse').val("false");
    $('#synapse_topic1id').val(tempNode.id);
    $('#synapse_topic2id').val(tempNode2.id);
    $('#new_synapse').fadeIn('fast');
    $('#synapse_desc').focus();
    tempNode = null;
    tempNode2 = null;
    tempInit = false;
  } else if (dragged && dragged != 0 && goRealtime) {
      saveLayout(dragged);
	  for (var i = 0; i < MetamapsModel.selectedNodes.length; i++) {
	    saveLayout(MetamapsModel.selectedNodes[i].id);
	  }
  }
}//onDragEndTopicHandler

function onDragCancelHandler(node, eventInfo, e, centred) {
  tempNode = null;
  tempNode2 = null;
  tempInit = false;

  //not sure why this doesn't happen for centred graphs
  if (!centred) {
    $('#topic_addSynapse').val("false");
    $('#topic_topic1id').val(0);
    $('#topic_topic2id').val(0);
  }
  Mconsole.plot();
}

function onPlaceLabelHandler(domElement, node) {
    var style = domElement.style;  
    var left = parseInt(style.left);  
    var top = parseInt(style.top);  
    var w = $('#topic_' + node.id + '_label').width();
    style.left = (left - w / 2) + 'px';  
    style.top = (top+20) + 'px';  
    style.display = '';
    
    // now position the showcard
    if (MetamapsModel.showcardInUse != null) {
        top = $('#' + MetamapsModel.showcardInUse).css('top');
        left = parseInt($('#' + MetamapsModel.showcardInUse).css('left'));
        if (0 != $('#topic_' + MetamapsModel.showcardInUse + '_label').width()) {
            MetamapsModel.widthOfLabel = $('#topic_' + MetamapsModel.showcardInUse + '_label').width();
        }
        w = MetamapsModel.widthOfLabel/2;
        left = (left + w) + 'px';
        $('#showcard').css('top', top);
        $('#showcard').css('left', left);
        
        Mconsole.labels.hideLabel(Mconsole.graph.getNode(MetamapsModel.showcardInUse));
    } 
}

// thanks to http://stackoverflow.com/questions/4338963/
// convert-html-character-entities-back-to-regular-text-using-javascript
function decodeEntities(desc) {
  var str, temp = document.createElement('p');
  temp.innerHTML = desc; //browser handles the entities
  str = temp.textContent || temp.innerText;
  temp = null; //delete the element;
  return str;
}//decodeEntities


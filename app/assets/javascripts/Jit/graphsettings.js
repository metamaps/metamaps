function graphSettings(type) {
   var t;

   if (type == "arranged" || type == "chaotic") {
      t = {
         //id of the visualization container
         injectInto: 'infovis',
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
            type: 'customEdge',
            lineWidth: 3
         },
         //Native canvas text styling
         Label: {
            type: 'HTML', //Native or HTML
            size: 20,
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
            type: 'HTML',
            //Change cursor style when hovering a node
            onMouseEnter: function () {
               
            },
            onMouseLeave: function () {
               
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
			   clickDragOnTopic(node, eventInfo, e);
            },
			onDragEnd: function() {
				if (tempInit && tempNode2 == null) {
					$('#item_addSynapse').val("true");
					$('#new_item').fadeIn('fast');
					addMetacode();
					$('#item_name').focus();
				}
				else if (tempInit && tempNode2 != null) {
					$('#item_addSynapse').val("false");
					$('#synapse_item1id').val(tempNode.id);
        			$('#synapse_item2id').val(tempNode2.id);
					$('#new_synapse').fadeIn('fast');
					$('#synapse_desc').focus();
					tempNode = null;
					tempNode2 = null;
					tempInit = false;
				}
			},
			onDragCancel: function() {
				tempNode = null;
				tempNode2 = null;
				tempInit = false;
				$('#item_addSynapse').val("false");
				$('#item_item1id').val(0);
				$('#item_item2id').val(0);
				Mconsole.plot();
			},
            //Implement the same handler for touchscreens
            onTouchMove: function (node, eventInfo, e) {
               $jit.util.event.stop(e); //stop default touchmove event
               this.onDragMove(node, eventInfo, e);
            },
            //Add also a click handler to nodes
            onClick: function (node, eventInfo, e) {
               //clicking on a node, or clicking on blank part of canvas?
               if (node.nodeFrom) {
					selectEdgeOnClickHandler(node);  
			   }
			   else if (node && !node.nodeFrom) {
                 selectNodeOnClickHandler(node);
               } else {
                 canvasDoubleClickHandler(eventInfo.getPos(), e);
               }//if
            }//onClick
         },
         //Number of iterations for the FD algorithm
         iterations: 200,
         //Edge length
         levelDistance: 200,
         // Add text to the labels. This method is only triggered
         // on label creation and only for DOM labels (not native canvas ones).
         onCreateLabel: function (domElement, node) {
			var html = 
           '<div class="CardOnGraph" title="Click to Hide" id="item_' + node.id + '"><p class="type">' + node.getData("itemcatname") + '</p>' + 
           '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
           '<div class="scroll"><a href="/items/' + node.id + '" class="title">' + node.name + '</a>' + 
		   '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' + 
           '<div class="desc"><p>' + node.getData('desc') + '</p></div></div>' +
           '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a></div>';
		   var showCard = document.createElement('div'); 
			showCard.className = 'showcard item_' + node.id;  
			showCard.innerHTML = html; 
			showCard.style.display = "none";
			domElement.appendChild(showCard);
			
			// add some events to the label
			showCard.onclick = function(){
				delete node.selected;
			    node.setData('dim', 25, 'current');
			    node.eachAdjacency(function (adj) {
				   adj.setDataset('end', {
					  lineWidth: 3,
					  color: '#222222'
				   });
				   adj.setData('showDesc', false, 'current');
			    });
				Mconsole.fx.animate({
				  modes: ['edge-property:lineWidth:color'],
				  duration: 500
			   });
				$('.showcard.item_' + node.id).fadeOut('fast', function(){
					$('.name').css('display','block');
					Mconsole.plot();
				});	
			}
			
            // Create a 'name' button and add it  
			// to the main node label  
			var nameContainer = document.createElement('span'),  
				style = nameContainer.style;  
			nameContainer.className = 'name item_' + node.id;  
			nameContainer.innerHTML = '<div class="label">' + node.name + '</div>';  
			domElement.appendChild(nameContainer);  
			style.fontSize = "0.9em";  
			style.color = "#222222";
			
			// add some events to the label
			nameContainer.onclick = function(){
				selectNodeOnClickHandler(node)
			} 
         },
         // Change node styles when DOM labels are placed
         // or moved.
         onPlaceLabel: function (domElement, node) {
            var style = domElement.style;
            var left = parseInt(style.left);
            var top = parseInt(style.top);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
            style.top = (top+25) + 'px';
            style.display = '';
         }
      };
   } else if (type = "centered") {
      t = {
         //id of the visualization container
         injectInto: 'infovis',
         //Optional: create a background canvas that plots  
         //concentric circles.  
         background: {
            CanvasStyles: {
               strokeStyle: '#333',
               lineWidth: 1.5
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
            type: 'customEdge',
            lineWidth: 3
         },
         //Native canvas text styling
         Label: {
            type: 'HTML', //Native or HTML
            size: 20,
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
            type: 'HTML',
            //Change cursor style when hovering a node
            onMouseEnter: function () {
               
            },
            onMouseLeave: function () {
               
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
               clickDragOnTopic(node, eventInfo, e);
            },
			onDragEnd: function() {
				if (tempInit && tempNode2 == null) {
					$('#item_addSynapse').val("true");
					$('#new_item').fadeIn('fast');
					addMetacode();
					$('#item_name').focus();
				}
				else if (tempInit && tempNode2 != null) {
					$('#item_addSynapse').val("false");
					$('#synapse_item1id').val(tempNode.id);
        			$('#synapse_item2id').val(tempNode2.id);
					$('#new_synapse').fadeIn('fast');
					$('#synapse_desc').focus();
					tempNode = null;
					tempNode2 = null;
					tempInit = false;
				}
			},
			onDragCancel: function() {
				tempNode = null;
				tempNode2 = null;
				tempInit = false;
				Mconsole.plot();
			},
            //Implement the same handler for touchscreens
            onTouchMove: function (node, eventInfo, e) {
               $jit.util.event.stop(e); //stop default touchmove event
               this.onDragMove(node, eventInfo, e);
            },
			//Add also a click handler to nodes
            onClick: function (node, eventInfo, e) {
               //clicking on an edge, a node, or clicking on blank part of canvas?
               if (eventInfo.getEdge() != false || node.nodeFrom) {
					if (eventInfo.getEdge() != false) selectEdgeOnClickHandler(eventInfo.getEdge());
					else if (node.nodeFrom) selectEdgeOnClickHandler(node);  
			   }
			   else if (node && !node.nodeFrom) {
				 if (!Mconsole.busy) {
					selectNodeOnClickHandler(node);
					Mconsole.onClick(node.id, {  
					   hideLabels: false  
					});
				 }
               } 
			   else {
                 canvasDoubleClickHandler(eventInfo.getPos(), e);
               }//if
            }//onClick
         },
         //Number of iterations for the FD algorithm
         iterations: 200,
         //Edge length
         levelDistance: 200,
         // Add text to the labels. This method is only triggered
         // on label creation and only for DOM labels (not native canvas ones).
         onCreateLabel: function (domElement, node) {
			var html = 
           '<div class="CardOnGraph" title="Click to Hide" id="item_' + node.id + '"><p class="type">' + node.getData("itemcatname") + '</p>' + 
           '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
           '<div class="scroll"><a href="/items/' + node.id + '" class="title">' + node.name + '</a>' + 
		   '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' + 
           '<div class="desc"><p>' + node.getData('desc') + '</p></div></div>' +
           '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a></div>';
		   var showCard = document.createElement('div'); 
			showCard.className = 'showcard item_' + node.id;  
			showCard.innerHTML = html; 
			showCard.style.display = "none";
			domElement.appendChild(showCard);
			
			// add some events to the label
			showCard.onclick = function(){
				if (!Mconsole.busy) {
					delete node.selected;
					node.setData('dim', 25, 'current');
					node.eachAdjacency(function (adj) {
					   adj.setDataset('end', {
						  lineWidth: 3,
						  color: '#222222'
					   });
					   adj.setData('showDesc', false, 'current');
					});
					Mconsole.fx.animate({
					  modes: ['edge-property:lineWidth:color'],
					  duration: 500
				   });
					$('.showcard.item_' + node.id).fadeOut('fast', function(){
						$('.name').css('display','block');
						Mconsole.plot();
					});	
				}
			}
			
            // Create a 'name' button and add it  
			// to the main node label  
			var nameContainer = document.createElement('span'),  
				style = nameContainer.style;  
			nameContainer.className = 'name item_' + node.id;  
			nameContainer.innerHTML = '<div class="label">' + node.name + '</div>';  
			domElement.appendChild(nameContainer);  
			style.fontSize = "0.9em";  
			style.color = "#222222";
			
			// add some events to the label
			nameContainer.onclick = function(){
				if (!Mconsole.busy) {
					selectNodeOnClickHandler(node);
					Mconsole.onClick(node.id, {  
					   hideLabels: false  
					});
				 }
			} 
         },
         // Change node styles when DOM labels are placed
         // or moved.
         onPlaceLabel: function (domElement, node) {
            var style = domElement.style;
            var left = parseInt(style.left);
            var top = parseInt(style.top);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
            style.top = (top+25) + 'px';
            style.display = '';
         }
      };
   }

   return t;
}

// defining code to draw edges with arrows pointing in the middle of them
var renderMidArrow = function(from, to, dim, swap, canvas){ 
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
        var midPoint = new $jit.Complex((to.x + from.x) / 2, (to.y + from.y) / 2); 
        // move midpoint by half the "length" of the arrow so the arrow is centered on the midpoint 
        midPoint.x += (vect.x / 0.7); 
        midPoint.y += (vect.y / 0.7); 
        // compute the tail intersection point with the edge line 
        var intermediatePoint = new $jit.Complex(midPoint.x - vect.x, 
midPoint.y - vect.y); 
        // vector perpendicular to vect 
        var normal = new $jit.Complex(-vect.y / 2, vect.x / 2); 
        var v1 = intermediatePoint.add(normal); 
        var v2 = intermediatePoint.$add(normal.$scale(-1)); 

        //ctx.strokeStyle = 'black';
        ctx.beginPath(); 
        ctx.moveTo(from.x, from.y); 
        ctx.lineTo(to.x, to.y); 
        ctx.stroke(); 
        ctx.beginPath(); 
        ctx.moveTo(v1.x, v1.y); 
        ctx.lineTo(midPoint.x, midPoint.y); 
        ctx.lineTo(v2.x, v2.y); 
        ctx.stroke(); 
};

// defining custom node type	
var nodeSettings = {
	  'customNode': {  
		  'render': function (node, canvas) {		  			  
			  var pos = node.pos.getc(true),
			  dim = node.getData('dim'),
			  cat = node.getData('itemcatname'),
			  inCommons = node.getData('inCommons'),
			  onCanvas = node.getData('onCanvas'),
			  ctx = canvas.getCtx();
			  
			  // if the topic is from the Commons draw a green circle around it
			  if (inCommons) {
				  ctx.beginPath();
				  ctx.arc(pos.x, pos.y, dim+3, 0, 2 * Math.PI, false);
				  ctx.strokeStyle = '#67be5f'; // green
				  ctx.lineWidth = 2;
				  ctx.stroke();
			  }
			  // if the topic is on the Canvas draw a white circle around it
			  if (onCanvas) {
				  ctx.beginPath();
				  ctx.arc(pos.x, pos.y, dim+3, 0, 2 * Math.PI, false);
				  ctx.strokeStyle = 'white';
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
  
  
// defining custom edges
 var edgeSettings = {  
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
				renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, true, canvas);
				renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, false, canvas);
		  }
		  else if (directionCat == "from-to") {
				var direction = adj.data.$direction;
				var inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id);
				renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, inv, canvas);
		  }
		   
		  //check for edge label in data  
		  var desc = adj.getData("desc") + ' (' + adj.getData("id") + ')';
		  var showDesc = adj.getData("showDesc");
		  if( desc != "" && showDesc ) { 
			 //now adjust the label placement 
			var radius = canvas.getSize(); 
			var x = parseInt((pos.x + posChild.x - (desc.length * 5)) /2); 
			var y = parseInt((pos.y + posChild.y) /2); 
			canvas.getCtx().fillStyle = '#000';
			canvas.getCtx().font = 'bold 14px arial';
			canvas.getCtx().fillText(desc, x, y); 
		  }
		}, 'contains' : function(adj, pos) { 
				var from = adj.nodeFrom.pos.getc(true), 
				 to = adj.nodeTo.pos.getc(true);
				return this.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon); 
		}  
	  }  
	}
	
function selectEdgeOnClickHandler(adj) {
      var showDesc = adj.getData("showDesc");
	  if (showDesc) {
		adj.setData('showDesc', false, 'current');
	  	Mconsole.plot();  
	  } else if (!showDesc) {
	  	adj.setData('showDesc', true, 'current');
	  	Mconsole.plot();
	  }
}//selectEdgeOnClickHandler

function selectNodeOnClickHandler(node) {
   
    $('.showcard').css('display','none');
	$('.name').css('display','block');
	$('.name.item_' + node.id).css('display','none');
	$('.showcard.item_' + node.id).fadeIn('fast');
				
   //set final styles  
   Mconsole.graph.eachNode(function (n) {
      if (n.id != node.id) delete n.selected;
      n.setData('dim', 25, 'current');
      n.eachAdjacency(function (adj) {
         adj.setDataset('end', {
            lineWidth: 3,
            color: '#222222'
         });
         adj.setData('showDesc', false, 'current');
      });
   });
   if (!node.selected) {
      node.selected = true;
	  node.setData('dim', 1, 'current');  

      node.eachAdjacency(function (adj) {
         adj.setDataset('end', {
            lineWidth: 4,
            color: '#FFF'
         });
         adj.setData('showDesc', true, 'current');
      });
   } else {
	  node.setData('dim', 25, 'current');
      delete node.selected;
   }
   //trigger animation to final styles  
   Mconsole.fx.animate({
      modes: ['edge-property:lineWidth:color'],
      duration: 500
   });
}//selectNodeOnClickHandler

//for the canvasDoubleClickHandler function
var canvasDoubleClickHandlerObject = new Object();
canvasDoubleClickHandlerObject.storedTime = 0;

function canvasDoubleClickHandler(canvasLoc,e) {
   var TOLERANCE = 300; //0.3 seconds

   //grab the location and timestamp of the click
   var storedTime = canvasDoubleClickHandlerObject.storedTime;
   var now = Date.now(); //not compatible with IE8 FYI

   if (now - storedTime < TOLERANCE) {
      //pop up node creation :)
	  $('#item_grabItem').val("null");
	  $('#item_addSynapse').val("false");
      document.getElementById('new_item').style.left = e.x + "px";
      document.getElementById('new_item').style.top = e.y + "px";
      $('#item_x').val(canvasLoc.x);
      $('#item_y').val(canvasLoc.y);
      $('#new_item').fadeIn('fast');
	  addMetacode();
      $('#item_name').focus();
   } else {
      canvasDoubleClickHandlerObject.storedTime = now;
	  $('#new_item').fadeOut('fast');
	  $('#new_synapse').fadeOut('fast');
	  tempInit = false;
	  tempNode = null;
	  tempNode2 = null;
	  Mconsole.plot();
   }
}//canvasDoubleClickHandler

// ForceDirected Mode: for the creation of new topics and synapses through clicking and draggin with right clicks off of topics
function clickDragOnTopic(node, eventInfo, e) {
    if (node && !node.nodeFrom) {
	   $('#new_synapse').fadeOut('fast');
	   $('#new_item').fadeOut('fast');
	   var pos = eventInfo.getPos();
	   // if it's a left click, move the node
	   if (e.button == 0 && !e.altKey ) {
		   node.pos.setc(pos.x, pos.y);
		   Mconsole.plot();
	   }
	   // if it's a right click, start synapse creation
	   else if (e.button == 2 || (e.button == 0 && e.altKey)) {
		   if (tempInit == false) {
			  tempNode = node;
			  tempInit = true;   
		   }
		   // 
		   temp = eventInfo.getNode();
		   if (temp != false && temp.id != node.id) { // this means a Node has been returned
			  tempNode2 = temp;
			  Mconsole.plot();
			  renderMidArrow({ x: tempNode.pos.getc().x, y: tempNode.pos.getc().y }, { x: temp.pos.getc().x, y: temp.pos.getc().y }, 13, false, Mconsole.canvas);
			  // before making the highlighted one bigger, make sure all the others are regular size
			  Mconsole.graph.eachNode(function (n) {
				  n.setData('dim', 25, 'current');
			  });
			  temp.setData('dim',35,'current');
			  Mconsole.fx.plotNode(tempNode, Mconsole.canvas);
			  Mconsole.fx.plotNode(temp, Mconsole.canvas);
		   } else if (!temp) {
			   tempNode2 = null;
			   Mconsole.graph.eachNode(function (n) {
				  n.setData('dim', 25, 'current');
			   });
			   //pop up node creation :)
			  $('#item_grabItem').val("null");
			  var myX = e.x - 110;
			  var myY = e.y - 30;
			  document.getElementById('new_item').style.left = myX + "px";
			  document.getElementById('new_item').style.top = myY + "px";
			  document.getElementById('new_synapse').style.left = myX + "px";
			  document.getElementById('new_synapse').style.top = myY + "px";
			  $('#item_x').val(eventInfo.getPos().x);
			  $('#item_y').val(eventInfo.getPos().y);
			  Mconsole.plot();
			  renderMidArrow({ x: tempNode.pos.getc().x, y: tempNode.pos.getc().y }, { x: pos.x, y: pos.y }, 13, false, Mconsole.canvas);
			  Mconsole.fx.plotNode(tempNode, Mconsole.canvas);
		   }
	   }
   }	
}
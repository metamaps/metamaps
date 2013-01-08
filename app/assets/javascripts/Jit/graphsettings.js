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
            zooming: 15 //zoom speed. higher is more sensible
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
            lineWidth: 2
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
            onMouseMove: function(node, eventInfo, e) {
              onMouseMoveHandler(node, eventInfo, e);
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
			    clickDragOnTopic(node, eventInfo, e);
            },
			onDragEnd: function() {
				if (tempInit && tempNode2 == null) {
					$('#topic_addSynapse').val("true");
					$('#new_topic').fadeIn('fast');
					addMetacode();
					$('#topic_name').focus();
				}
				else if (tempInit && tempNode2 != null) {
					$('#topic_addSynapse').val("false");
					$('#synapse_topic1id').val(tempNode.id);
        	$('#synapse_topic2id').val(tempNode2.id);
					$('#new_synapse').fadeIn('fast');
					$('#synapse_desc').focus();
					tempNode = null;
					tempNode2 = null;
					tempInit = false;
				}
                else if (dragged != 0 && goRealtime) { saveLayout(dragged); }
			},
			onDragCancel: function() {
				tempNode = null;
				tempNode2 = null;
				tempInit = false;
				$('#topic_addSynapse').val("false");
				$('#topic_topic1id').val(0);
				$('#topic_topic2id').val(0);
				Mconsole.plot();
			},
            //Implement the same handler for touchscreens
            onTouchMove: function (node, eventInfo, e) {
               $jit.util.event.stop(e); //stop default touchmove event
               this.onDragMove(node, eventInfo, e);
            },
            //Add also a click handler to nodes
            onClick: function (node, eventInfo, e) {
			   if (e.target.id != "infovis-canvas") return false;
               //clicking on a node, or clicking on blank part of canvas?
               if (node.nodeFrom) {
                 selectEdgeOnClickHandler(node, e);  
			   }
			   else if (node && !node.nodeFrom) {
                 selectNodeOnClickHandler(node, e);
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
           onCreateLabelHandler(domElement, node);
         },
         // Change node styles when DOM labels are placed
         // or moved.
         onPlaceLabel: function (domElement, node) {
            var style = domElement.style;
            var left = parseInt(style.left);
            var top = parseInt(style.top);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2 + 107) + 'px';
			//style.left = (left - w / 2) + 'px';
            style.top = (top-165) + 'px';
            style.display = '';
			var label = document.getElementById('topic_' + node.id + '_label');
			w = label.offsetWidth;
			style = label.style;
            style.left = (-(w / 2 + 106)) + 'px';	
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
            zooming: 15 //zoom speed. higher is more sensible
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
            lineWidth: 2
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
            onMouseMove: function(node, eventInfo, e) {
              onMouseMoveHandler(node, eventInfo, e);
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
			   clickDragOnTopic(node, eventInfo, e);
            },
			onDragEnd: function() {
				if (tempInit && tempNode2 == null) {
					$('#topic_addSynapse').val("true");
					$('#new_topic').fadeIn('fast');
					addMetacode();
					$('#topic_name').focus();
				}
				else if (tempInit && tempNode2 != null) {
					$('#topic_addSynapse').val("false");
					$('#synapse_topic1id').val(tempNode.id);
        			$('#synapse_topic2id').val(tempNode2.id);
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
			   if (e.target.id != "infovis-canvas") return false;
               //clicking on an edge, a node, or clicking on blank part of canvas?
               if (eventInfo.getNode() == false) {
					if (eventInfo.getEdge() != false) selectEdgeOnClickHandler(eventInfo.getEdge(), e);
					else if (node.nodeFrom) selectEdgeOnClickHandler(node, e);  
			   }
			   else if (node && !node.nodeFrom) {
				 if (!Mconsole.busy) {
					selectNodeOnClickHandler(node, e);
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
           onCreateLabelHandler(domElement, node);
         },
         // Change node styles when DOM labels are placed
         // or moved.
         onPlaceLabel: function (domElement, node) {
            var style = domElement.style;
            var left = parseInt(style.left);
            var top = parseInt(style.top);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2 + 107) + 'px';
			//style.left = (left - w / 2) + 'px';
            style.top = (top-165) + 'px';
            style.display = '';
			var label = document.getElementById('topic_' + node.id + '_label');
			w = label.offsetWidth;
			style = label.style;
            style.left = (-(w / 2 + 106)) + 'px';
         }
      };
   }

   /*$('body').keypress(function(e) {
     console.log(e);
     switch(e.keyCode) {
       case 114: case 82:
         removeSelectedEdges();
         break;
       case 100: case 68:
         deleteSelectedEdges();
         break;
     }//switch
   });*/

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
        var arrowPoint = new $jit.Complex((vect.x / 0.7) + midPoint.x, (vect.y / 0.7) + midPoint.y);
        // compute the tail intersection point with the edge line 
        var intermediatePoint = new $jit.Complex(arrowPoint.x - vect.x, 
arrowPoint.y - vect.y); 
        // vector perpendicular to vect 
        var normal = new $jit.Complex(-vect.y / 2, vect.x / 2); 
        var v1 = intermediatePoint.add(normal); 
        var v2 = intermediatePoint.$add(normal.$scale(-1)); 

        //ctx.strokeStyle = "#222222";
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
		  var desc = adj.getData("desc");
		  var showDesc = adj.getData("showDesc");
		  if( desc != "" && showDesc ) { 
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

function editEdge(edge, e) {
  //reset so we don't interfere with other edges
  $('#edit_synapse').remove();

  deselectEdge(edge); //so the label is missing while editing
  var edit_div = document.createElement('div');
  edit_div.setAttribute('id', 'edit_synapse');
  $('.main .wrapper').append(edit_div);
  $('#edit_synapse').attr('class', 'best_in_place best_in_place_desc');
  $('#edit_synapse').attr('data-object', 'synapse');
  $('#edit_synapse').attr('data-attribute', 'desc');
  $('#edit_synapse').attr('data-type', 'input');
  //TODO how to get blank data-nil
  $('#edit_synapse').attr('data-nil', ' ');
  $('#edit_synapse').attr('data-url', '/synapses/' + edge.getData("id"));
  $('#edit_synapse').html(edge.getData("desc"));

  $('#edit_synapse').css('position', 'absolute');
  $('#edit_synapse').css('left', e.clientX);
  $('#edit_synapse').css('top', e.clientY);

  $('#edit_synapse').bind("ajax:success", function() {
    var desc = $(this).html();
    edge.setData("desc", desc);
    selectEdge(edge);
    Mconsole.plot();
    $('#edit_synapse').remove();
  });

  $('#edit_synapse').focusout(function() {
    //in case they cancel
//    $('#edit_synapse').hide();
  });
  
  //css stuff above moves it, this activates it
  $('#edit_synapse').click();
  $('#edit_synapse form').submit(function() {
    //hide it once form submits.
    //If you don't do this, and data is unchanged, it'll show up on canvas
    $('#edit_synapse').hide();
  });
  $('#edit_synapse input').focus();
  $('#edit_synapse').show();
}

function selectEdgeOnClickHandler(adj, e) {
  //editing overrides everything else
  if (e.altKey) {
    editEdge(adj, e);
    return;
  }

  var showDesc = adj.getData("showDesc");
  if (showDesc && e.shiftKey) {
    //deselecting an edge with shift
    deselectEdge(adj);
  } else if (!showDesc && e.shiftKey) {
    //selecting an edge with shift
    selectEdge(adj);
  } else if (showDesc && !e.shiftKey) {
    //deselecting an edge without shift - unselect all
    deselectAllEdges();
  } else if (!showDesc && !e.shiftKey) {
    //selecting an edge without shift - unselect all but new one
    deselectAllEdges();
    selectEdge(adj);
  }

  Mconsole.plot();
}//selectEdgeOnClickHandler

function deselectAllEdges() {
  for (var i = 0; i < selectedEdges.length; i += 1) {
    var edge = selectedEdges[i];
    deselectEdge(edge);
  }  
}

function selectNodeOnClickHandler(node, e) {
  //set final styles 
  if (!e.shiftKey) { 
	  Mconsole.graph.eachNode(function (n) {
		if (n.id != node.id) {
			delete n.selected;
			n.setData('onCanvas',false);
		}
		
		n.setData('dim', 25, 'current');
		n.eachAdjacency(function (adj) {
		  deselectEdge(adj);
		});
	  });
  }
  if (!node.selected) {
    node.selected = true;
    node.setData('dim', 30, 'current');  
    node.setData('onCanvas',true);
    node.eachAdjacency(function (adj) {
      selectEdge(adj);
    });
    Mconsole.plot();
  } else {
    node.setData('dim', 25, 'current');
    delete node.selected;
	node.setData('onCanvas',false);
  }
  //trigger animation to final styles  
  Mconsole.fx.animate({
    modes: ['edge-property:lineWidth:color'],
    duration: 500
  });
  Mconsole.plot();
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
	    $('#topic_grabTopic').val("null");
	    $('#topic_addSynapse').val("false");
      $('#new_topic').css('left',e.clientX + "px");
      $('#new_topic').css('top',e.clientY + "px");
      $('#topic_x').val(canvasLoc.x);
      $('#topic_y').val(canvasLoc.y);
      $('#new_topic').fadeIn('fast');
	  addMetacode();
      $('#topic_name').focus();
   } else {
      canvasDoubleClickHandlerObject.storedTime = now;
	  $('#new_topic').fadeOut('fast');
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
	   $('#new_topic').fadeOut('fast');
	   var pos = eventInfo.getPos();
	   // if it's a left click, move the node
	   if (e.button == 0 && !e.altKey && (e.buttons == 0 || e.buttons == 1 || e.buttons == undefined)) {
		   dragged = node.id;
       node.pos.setc(pos.x, pos.y);
       node.data.$xloc = pos.x;
       node.data.$yloc = pos.y;
		   Mconsole.plot();
	   }
	   // if it's a right click or holding down alt, start synapse creation  ->third option is for firefox
	   else if ((e.button == 2 || (e.button == 0 && e.altKey) || e.buttons == 2) && userid != null) {
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
			  $('#topic_grabTopic').val("null");
			  var myX = e.clientX - 110;
			  var myY = e.clientY - 30;
			  $('#new_topic').css('left',myX + "px");
              $('#new_topic').css('top',myY + "px");
              $('#new_synapse').css('left',myX + "px");
              $('#new_synapse').css('top',myY + "px");
			  $('#topic_x').val(eventInfo.getPos().x);
			  $('#topic_y').val(eventInfo.getPos().y);
			  Mconsole.plot();
			  renderMidArrow({ x: tempNode.pos.getc().x, y: tempNode.pos.getc().y }, { x: pos.x, y: pos.y }, 13, false, Mconsole.canvas);
			  Mconsole.fx.plotNode(tempNode, Mconsole.canvas);
		   }
	   }
   }	
}

function onCreateLabelHandler(domElement, node) {
  var html = '                                                                \
    <div class="CardOnGraph"                                                  \
         id="topic_$_id_$">                                                   \
      <p class="type best_in_place best_in_place_metacode"                    \
         data-url="/topics/$_id_$"                                            \
         data-object="topic"                                                  \
         data-collection=$_metacode_choices_$                                 \
         data-attribute="metacode"                                            \
         data-type="select">$_metacode_$</p>                                  \
      <img alt="$_metacode_$"                                                 \
           class="icon"                                                       \
		   title="Click to hide card"                                         \
           height="50"                                                        \
           width="50"                                                         \
           src="$_imgsrc_$" />                                                \
        <span class="title">                                                  \
          <span class="best_in_place best_in_place_name"                      \
                data-url="/topics/$_id_$"                                     \
                data-object="topic"                                           \
                data-attribute="name"                                         \
                data-type="input">$_name_$</span>                             \
          <a href="/topics/$_id_$" class="topic-go-arrow" target="_blank">    \
            <img class="topic-go-arrow"                                       \
                 title="Explore Topic"                                        \
                 src="/assets/go-arrow.png" />                                \
          </a>                                                                \
          <div class="clearfloat"></div>                                      \
        </span>                                                               \
        <div class="contributor">                                             \
          Added by: <a href="/users/$_userid_$" target="_blank">$_username_$  \
          </a>                                                                \
        </div>                                                                \
      <div class="scroll">                                                    \
        <div class="desc">                                                    \
          <span class="best_in_place best_in_place_desc"                      \
                data-url="/topics/$_id_$"                                     \
                data-object="topic"                                           \
                data-nil="$_desc_nil_$"                                       \
                data-attribute="desc"                                         \
				data-ok-button="Save"                                         \
				data-cancel-button="Discard"                                   \
                data-type="textarea">$_desc_$</span>                          \
				<div class="clearfloat"></div>                                \
        </div>                                                                \
      </div>                                                                  \
	  <div class="link">                                                      \
      $_go_link_$                                                             \
      $_a_tag_$<span class="best_in_place best_in_place_link"                 \
            data-url="/topics/$_id_$"                                         \
            data-object="topic"                                               \
            data-attribute="link"                                             \
            data-type="input">$_link_$</span>$_close_a_tag_$                  \
	  </div>                                                                  \
	  <div class="clearfloat"></div>                                          \
    </div>';

  //link is rendered differently if user is logged out or in
  var go_link, a_tag, close_a_tag;
  if (userid == null) {
    go_link = '';
	if (node.getData("link") != "") {
      a_tag = '<a href="' + node.getData("link") + '">';
      close_a_tag = '</a>';
	}
	else { 
	  a_tag = '';
	  close_a_tag = '';
    }  
  } else {
    go_link = '<a href="' + node.getData("link") + '" ' + 
              '   class="go-link" target="_blank">[go]</a>';
    a_tag = '';
    close_a_tag = '';
  }

  //create metacode_choices array from imgArray
  var metacodes = new Array();
  for (var key in imgArray) {
    if (imgArray.hasOwnProperty(key)) {
      if (key != node.getData("metacode")) {
        metacodes.push(key);
      }
    }
  }
 
  //Arrange it how we want it
  metacodes.sort();
  metacodes.unshift(node.getData("metacode")); 

  var metacode_choices = "'[";
  for (var i in metacodes) {
    metacode_choices += '["' + metacodes[i] + '","' + metacodes[i] + '"],';
  }
  //remove trailing comma and add ]
  metacode_choices = metacode_choices.slice(0, -1); 
  metacode_choices += "]'";

  var desc_nil = "<span class='gray'>Click to add description.</span>";
  var link_nil = "<span class='gray'>Click to add link.</span>";

  html = html.replace(/\$_id_\$/g, node.id);
  html = html.replace(/\$_metacode_\$/g, node.getData("metacode"));
  html = html.replace(/\$_imgsrc_\$/g, imgArray[node.getData("metacode")].src);
  html = html.replace(/\$_name_\$/g, node.name);
  html = html.replace(/\$_userid_\$/g, node.getData("userid"));
  html = html.replace(/\$_username_\$/g, node.getData("username"));
  html = html.replace(/\$_metacode_choices_\$/g, metacode_choices);
  html = html.replace(/\$_go_link_\$/g, go_link);
  html = html.replace(/\$_a_tag_\$/g, a_tag);
  html = html.replace(/\$_close_a_tag_\$/g, close_a_tag);
  if (node.getData("link") == "" && userid != null) {
    html = html.replace(/\$_link_\$/g, link_nil);
  } else {
    html = html.replace(/\$_link_\$/g, node.getData("link"));
  }

  html = html.replace(/\$_desc_nil_\$/g, desc_nil);
  if (node.getData("desc") == "" && userid != null) {
    //logged in but desc isn't there so it's invisible
    html = html.replace(/\$_desc_\$/g, desc_nil);
  } else {
    html = html.replace(/\$_desc_\$/g, node.getData("desc"));
  }

  var showCard = document.createElement('div');
  showCard.className = 'showcard topic_' + node.id;
  showCard.innerHTML = html;
  showCard.style.display = "none";
  domElement.appendChild(showCard);

  // add some events to the label
  $(showCard).find('img.icon').click(function(){
    hideCard(node);
  });
  
  $(showCard).find('.scroll').mCustomScrollbar();

  // Create a 'name' button and add it to the main node label
  var nameContainer = document.createElement('span'),
  style = nameContainer.style;
  nameContainer.className = 'name topic_' + node.id;
  nameContainer.id = 'topic_' + node.id + '_label';
  
  var littleHTML = '                                                    \
		 <div class="label">$_name_$</div>                              \
		 <div class="nodeOptions">';
  if ((userid == null || mapid == null) && node.id != Mconsole.root) {
	  littleHTML += '                                                   \
		   <span class="removeFromCanvas"                               \
				 onclick="removeFromCanvas($_id_$)"                     \
				 title="Click to remove topic from canvas">              \
		   </span>';
  }
  else if (mapid != null && userid != null && node.id != Mconsole.root) {
	  littleHTML += '                                               \
	  <span class="removeFromCanvas"                                \
				 onclick="removeFromCanvas($_id_$)"                 \
				 title="Click to remove topic from canvas">         \
	  </span>                                                       \
	  <a href="/topics/$_mapid_$/$_id_$/removefrommap"            \
		  title="Click to remove topic from map"                    \
		  class="removeFromMap"                                     \
		  data-method="post"                                         \
		  data-remote="true"                                        \
		  rel="nofollow">                                           \
	  </a>';
  }
  if (userid != null && node.id != Mconsole.root) {
	  littleHTML += '                                               \
	  <a href="/topics/$_id_$"                                      \
		  title="Click to delete this topic"                        \
		  class="deleteTopic"                                               \
		  data-confirm="Delete this topic and all synapses linking to it?"  \
		  data-method="delete"                                      \
		  data-remote="true"                                        \
		  rel="nofollow">                                           \
	  </a>';
  }
  littleHTML += '</div>';
  littleHTML = littleHTML.replace(/\$_id_\$/g, node.id);
  littleHTML = littleHTML.replace(/\$_mapid_\$/g, mapid);
  littleHTML = littleHTML.replace(/\$_name_\$/g, node.name);
  nameContainer.innerHTML = littleHTML;
  domElement.appendChild(nameContainer);
  style.fontSize = "0.9em";
  style.color = "#222222";

  // add some events to the label
  $(nameContainer).find('.label').click(function(e){
    $('.showcard').css('display','none');
    $('.name').css('display','block');
    $('.name.topic_' + node.id).css('display','none');
    $('.showcard.topic_' + node.id).fadeIn('fast');
	selectNodeOnClickHandler(node,e);
	node.setData('dim', 1, 'current');
  });
  
  nameContainer.onmouseover = function(){
    $('.name.topic_' + node.id + ' .nodeOptions').css('display','block');
  }
  
  nameContainer.onmouseout = function(){
    $('.name.topic_' + node.id + ' .nodeOptions').css('display','none');
  }

  //jQuery selector for the card thing at the top of a topic view
  //only works if we're editing the topic whose page we are on
  //e.g. on /topics/1 you only need to update .focus.topic_1
  var topcard = '.focus.topic_' + node.id;

  //bind best_in_place ajax callbacks
  $(showCard).find('.best_in_place_metacode')
      .bind("ajax:success", function() {
    var metacode = $(this).html();
    //changing img alt, img src for top card (topic view page) 
    //and on-canvas card. Also changing image of node
    $(showCard).find('img.icon').attr('alt', metacode);
    $(showCard).find('img.icon').attr('src', imgArray[metacode].src);
    $(topcard + ' img').attr('alt', metacode);
    $(topcard + ' img').attr('src', imgArray[metacode].src);
    $(topcard + ' .focusleft p').html(metacode);
    node.setData("metacode", metacode);
    Mconsole.plot();
  });
  
  $(showCard).find('.best_in_place_name').bind("ajax:success", function() {
    var name = $(this).html();
    $(nameContainer).find('.label').html(name);
    $(topcard + ' .focusmiddle .title-text').html(name);
  });

  $(showCard).find('.best_in_place_desc').bind("ajax:success", function() {
    var desc = $(this).html();
    $(topcard + ' .focusmiddle p').html(desc);
  });

  $(showCard).find('.best_in_place_link').bind("ajax:success", function() {
    var link = $(this).html();
    $(topcard + ' .focusright a').html(link);
    $(topcard + ' .focusright a').attr('href', link);
    $(showCard).find('.go-link').attr('href', link);
  });

}//onCreateLabelHandler

function hideCard(node) {
  var card = '.showcard';
  if (node != null) {
    card += '.topic_' + node.id;
  }
  
  $(card).fadeOut('fast', function(){
    node.setData('dim', 25, 'current');
    $('.name').show();
    Mconsole.plot();
  });
}

//edge that the mouse is currently hovering over
var edgeHover = false;

function onMouseMoveHandler(node, eventInfo, e) {
  var edge = eventInfo.getEdge();
  var node = eventInfo.getNode();
  
  //if we're on top of a node object, act like there aren't edges under it
  if (node != false) {
    if (edgeHover) {
      onMouseLeave(edgeHover);
    }
    return;
  }

  if (edge == false && edgeHover != false) {
    //mouse not on an edge, but we were on an edge previously
    onMouseLeave(edgeHover);
  } else if (edge != false && edgeHover == false) {
    //mouse is on an edge, but there isn't a stored edge
    onMouseEnter(edge);
  } else if (edge != false && edgeHover != edge) {
    //mouse is on an edge, but a different edge is stored
    onMouseLeave(edgeHover)
    onMouseEnter(edge);
  }
  edgeHover = edge;
}

function onMouseEnter(edge) {
  $('canvas').css('cursor', 'pointer');
  var showDesc = edge.getData("showDesc");
  if (!showDesc) {
    edge.setDataset('end', {
      lineWidth: 4,
      color: '#222222'
    });
    Mconsole.fx.animate({
      modes: ['edge-property:lineWidth:color'],
      duration: 100
    });
    Mconsole.plot();
  }
}

function onMouseLeave(edge) {
  $('canvas').css('cursor', 'default');
  var showDesc = edge.getData("showDesc");
  if (!showDesc) {
    edge.setDataset('end', {
      lineWidth: 2,
      color: '#222222'
    });
    Mconsole.fx.animate({
      modes: ['edge-property:lineWidth:color'],
      duration: 100
    });
  }
  Mconsole.plot();
}
 
// this is for hiding one topic from your canvas
function removeEdge(edge) {
  var id = edge.getData("id");
  $.ajax({
    type: "DELETE",
    url: "/synapses/" + id,
    success: function(){
      hideEdge(edge);
    },
  });
} 

function hideEdge(edge) {
  var from = edge.nodeFrom.id;
  var to = edge.nodeTo.id;
  edge.setData('alpha', 0, 'end');
  Mconsole.fx.animate({
    modes: ['edge-property:alpha'],
    duration: 1000
  });
  Mconsole.graph.removeAdjacence(from, to);
  Mconsole.plot();
}

function hideSelectedEdges() {
  for (var i = 0; i < selectedEdges.length; i += 1) {
    var edge = selectedEdges[i];
    hideEdge(edge);
  }
  selectedEdges = new Array();
}

function removeSelectedEdges() {
  for (var i = 0; i < selectedEdges.length; i += 1) {
    if (mapid != null) {
      var edge = selectedEdges[i];
      var id = edge.getData("id");
      //delete mapping of id mapid
      $.ajax({
        type: "POST",
        url: "/synapses/" + mapid + "/" + id + "/removefrommap",
      });
    }
    hideEdge(edge);
  }
  selectedEdges = new Array();
}

function deleteSelectedEdges() {
  for (var i = 0; i < selectedEdges.length; i += 1) {
    var edge = selectedEdges[i];
    var id = edge.getData("id");
    $.ajax({
      type: "DELETE",
      url: "/synapses/" + id,
    });
    hideEdge(edge);
  }
  selectedEdges = new Array();
}

//keeps track of all selected edges globally
var selectedEdges = new Array();

function selectEdge(edge) {
  var showDesc = edge.getData("showDesc");
  if (! showDesc) {
    edge.setData('showDesc', true, 'current');
    edge.setDataset('end', {
      lineWidth: 4,
      color: '#FFFFFF'
    });
    Mconsole.fx.animate({
      modes: ['edge-property:lineWidth:color'],
      duration: 100
    });
  }
  selectedEdges.push(edge);
}

function deselectEdge(edge) {
  var showDesc = edge.getData("showDesc");
  if (showDesc) {
    edge.setData('showDesc', false, 'current');
    edge.setDataset('end', {
      lineWidth: 2,
      color: '#222222'
    });

    if (edgeHover == edge) {
      edge.setDataset('end', {
        lineWidth: 4,
        color: '#222222'
      });
    }

    Mconsole.fx.animate({
      modes: ['edge-property:lineWidth:color'],
      duration: 100
    });
  }
  selectedEdges.splice(selectedEdges.indexOf(edge), 1);
}

function hideSelectedNodes() {
  Mconsole.graph.eachNode( function (n) {
	  if (n.data.$onCanvas == true && n.id != Mconsole.root) {	  
		  removeFromCanvas(n.id);	
	  }
  });
}

function removeSelectedNodes() {
  Mconsole.graph.eachNode( function (n) {
	  if (n.data.$onCanvas == true && n.id != Mconsole.root) {	  
		  $.ajax({
			type: "POST",
			url: "/topics/" + mapid + "/" + n.id + "/removefrommap",
		  });	
	  }
  });
}

function deleteSelectedNodes() {
  Mconsole.graph.eachNode( function (n) {
	  if (n.data.$onCanvas == true && n.id != Mconsole.root) {	  
		$.ajax({
		  type: "DELETE",
		  url: "/topics/" + n.id,
		});	
	  }
  });
}

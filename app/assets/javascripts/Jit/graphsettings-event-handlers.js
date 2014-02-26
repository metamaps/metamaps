function selectEdgeOnClickHandler(adj, e) {
  if (Mconsole.busy) return;
  
  if (synapseWasDoubleClicked()) {
    synapseDoubleClickHandler(adj, e);
    return;
  }


  var edgeIsSelected = MetamapsModel.selectedEdges.indexOf(adj);
  if (edgeIsSelected == -1) edgeIsSelected = false;
  else if (edgeIsSelected != -1) edgeIsSelected = true;
  
  if (edgeIsSelected && e.shiftKey) {
    //deselecting an edge with shift
    deselectEdge(adj);
  } else if (!edgeIsSelected && e.shiftKey) {
    //selecting an edge with shift
    selectEdge(adj);
  } else if (edgeIsSelected && !e.shiftKey) {
    //deselecting an edge without shift - unselect all
    deselectAllEdges();
  } else if (!edgeIsSelected && !e.shiftKey) {
    //selecting an edge without shift - unselect all but new one
    deselectAllEdges();
    selectEdge(adj);
  }

  Mconsole.plot();
}//selectEdgeOnClickHandler

function selectEdgeOnRightClickHandler(adj, e) {
    // the 'node' variable is a JIT node, the one that was clicked on
    // the 'e' variable is the click event
    
    e.preventDefault();
    e.stopPropagation();
    
    if (Mconsole.busy) return;
    
    selectEdge(adj);
    
    // delete old right click menu
    $('.rightclickmenu').remove();
    // create new menu for clicked on node
    var rightclickmenu = document.createElement("div");
    rightclickmenu.className = "rightclickmenu";
    
    // add the proper options to the menu
    var menustring = '<ul>';
    
    if (userid != null) menustring += '<li class="rc-delete">Delete</li>';
    if (mapid && userid != null) menustring += '<li class="rc-remove">Remove from Map</li>';
    menustring += '<li class="rc-hide">Hide until refresh</li>';
    
    menustring += '</ul>';
    rightclickmenu.innerHTML = menustring;
    
    // position the menu where the click happened
    $(rightclickmenu).css({
      left: e.clientX,
      top: e.clientY
    });
    //add the menu to the page
    $('#center-container').append(rightclickmenu);
    
    
    // attach events to clicks on the list items
    
    // delete the selected things from the database
    $('.rc-delete').click(function() {
      $('.rightclickmenu').remove();
      var n = MetamapsModel.selectedNodes.length;
      var e = MetamapsModel.selectedEdges.length;
      var ntext = n == 1 ? "1 topic" : n + " topics";
      var etext = e == 1 ? "1 synapse" : e + " synapses";
      var text = "You have " + ntext + " and " + etext + " selected. ";
      
      var r=confirm(text + "Are you sure you want to permanently delete them all? This will remove them from all maps they appear on."); 
      if (r == true) {
        deleteSelectedEdges();
        deleteSelectedNodes();
      }
    });
    
    // remove the selected things from the map
    $('.rc-remove').click(function() {
      $('.rightclickmenu').remove();
      removeSelectedEdges();
      removeSelectedNodes();
    });
    
    // hide selected nodes and synapses until refresh
    $('.rc-hide').click(function() {
      $('.rightclickmenu').remove();
      hideSelectedEdges();
      hideSelectedNodes();
    });
      
  } //selectEdgeOnRightClickHandler


function synapseDoubleClickHandler(adj, e) {
  editEdge(adj, e);
}

/*
 * Returns a boolean saying if the synapse was double clicked in our understanding of the word
 */
function synapseWasDoubleClicked() {
   //grab the timestamp of the click 
   var storedTime = MetamapsModel.lastSynapseClick;
   var now = Date.now(); //not compatible with IE8 FYI 
   MetamapsModel.lastSynapseClick = now;
 
   if (now - storedTime < MetamapsModel.DOUBLE_CLICK_TOLERANCE) { 
     return true;
   } else {
     return false;
   }
}//synapseWasDoubleClicked;

function nodeDoubleClickHandler(node, e) {
  openNodeShowcard(node);
}

function enterKeyHandler(event) {
  
  //var selectedNodesCopy = MetamapsModel.selectedNodes.slice(0);
  //var len = selectedNodesCopy.length;
  //for (var i = 0; i < len; i += 1) { 
  //  n = selectedNodesCopy[i]; 
  //  keepFromCommons(n);
  //}//for
  //Mconsole.plot();
}//enterKeyHandler

function escKeyHandler() {
  deselectAllEdges();
  deselectAllNodes();
}//escKeyHandler

/*
 * Make a node "in the commons" (with a green circle) lose its
 * green circle so it stays on the console/map/...
 */
function keepFromCommons(event, id) {
  if (userid == null) {
    return;
  }

  $('#topic_addSynapse').val("false");
  $('#topic_x').val(0); 
  $('#topic_y').val(0); 
  $('#topic_grabTopic').val(id);
	$('.new_topic').submit();
  
  event.preventDefault();
  event.stopPropagation();
  return false;
}//doubleClickNodeHandler

/*
 * Returns a boolean saying if the node was double clicked in our understanding of the word
 */
function nodeWasDoubleClicked() {
   //grab the timestamp of the click 
   var storedTime = MetamapsModel.lastNodeClick;
   var now = Date.now(); //not compatible with IE8 FYI 
   MetamapsModel.lastNodeClick = now;
 
   if (now - storedTime < MetamapsModel.DOUBLE_CLICK_TOLERANCE) { 
     return true;
   } else {
     return false;
   }
}//nodeWasDoubleClicked;

function selectNodeOnClickHandler(node, e) {
  if (Mconsole.busy) return;

  var check = nodeWasDoubleClicked();
  if (check) {
    nodeDoubleClickHandler(node, e);
    return;
  } else {
    // wait a certain length of time, then check again, then run this code
    setTimeout(function() {
      if (!nodeWasDoubleClicked()) {
        if (!e.shiftKey) {
            Mconsole.graph.eachNode(function (n) {
              if (n.id != node.id) {
                deselectNode(n);
              }
            });
        }
        if (node.selected) {
          deselectNode(node);
        } else {
          selectNode(node);
        }
        //trigger animation to final styles
        Mconsole.fx.animate({
          modes: ['edge-property:lineWidth:color:alpha'],
          duration: 500
        });
        Mconsole.plot();
      }
    }, MetamapsModel.DOUBLE_CLICK_TOLERANCE);
  }
}//selectNodeOnClickHandler

  function selectNodeOnRightClickHandler(node, e) {
    // the 'node' variable is a JIT node, the one that was clicked on
    // the 'e' variable is the click event
    
    e.preventDefault();
    e.stopPropagation();
    
    if (Mconsole.busy) return;
    
    selectNode(node);
    
    // delete old right click menu
    $('.rightclickmenu').remove();
    // create new menu for clicked on node
    var rightclickmenu = document.createElement("div");
    rightclickmenu.className = "rightclickmenu";
    
    // add the proper options to the menu
    var menustring = '<ul>';
    
    if (userid != null) menustring += '<li class="rc-delete">Delete</li>';
    if (mapid && userid != null) menustring += '<li class="rc-remove">Remove from Map</li>';
    menustring += '<li class="rc-hide">Hide until refresh</li>';
    
    if (!mapid) menustring += '<li class="rc-center">Center This Topic</li>';
    menustring += '<li class="rc-popout">Open In New Tab</li>';
    
    menustring += '</ul>';
    rightclickmenu.innerHTML = menustring;
    
    // position the menu where the click happened
    $(rightclickmenu).css({
      left: e.clientX,
      top: e.clientY
    });
    //add the menu to the page
    $('#center-container').append(rightclickmenu);
    
    
    // attach events to clicks on the list items
    
    // delete the selected things from the database
    $('.rc-delete').click(function() {
      $('.rightclickmenu').remove();
      var n = MetamapsModel.selectedNodes.length;
      var e = MetamapsModel.selectedEdges.length;
      var ntext = n == 1 ? "1 topic" : n + " topics";
      var etext = e == 1 ? "1 synapse" : e + " synapses";
      var text = "You have " + ntext + " and " + etext + " selected. ";
      
      var r=confirm(text + "Are you sure you want to permanently delete them all? This will remove them from all maps they appear on."); 
      if (r == true) {
        deleteSelectedEdges();
        deleteSelectedNodes();
      }
    });
    
    // remove the selected things from the map
    $('.rc-remove').click(function() {
      $('.rightclickmenu').remove();
      removeSelectedEdges();
      removeSelectedNodes();
    });
    
    // hide selected nodes and synapses until refresh
    $('.rc-hide').click(function() {
      $('.rightclickmenu').remove();
      hideSelectedEdges();
      hideSelectedNodes();
    });
    
    // when in radial, center on the topic you picked
    $('.rc-center').click(function() {
      $('.rightclickmenu').remove();
      centerOn(node.id);
    });
    
    // open the entity in a new tab
    $('.rc-popout').click(function() {
      $('.rightclickmenu').remove();
      var win=window.open('/topics/' + node.id, '_blank');
      win.focus();
    });
      
  } //selectNodeOnRightClickHandler

function canvasDoubleClickHandler(canvasLoc,e) { 
   //grab the location and timestamp of the click 
   var storedTime = MetamapsModel.lastCanvasClick;
   var now = Date.now(); //not compatible with IE8 FYI 
   MetamapsModel.lastCanvasClick = now;
 
   if (now - storedTime < MetamapsModel.DOUBLE_CLICK_TOLERANCE) { 
      //pop up node creation :) 
      $('#topic_grabTopic').val("null"); 
      $('#topic_addSynapse').val("false"); 
      $('#new_topic').css('left', e.clientX + "px"); 
      $('#new_topic').css('top', e.clientY + "px"); 
      $('#topic_x').val(canvasLoc.x); 
      $('#topic_y').val(canvasLoc.y);      
      $('#new_topic').fadeIn('fast');
      $('#topic_name').focus(); 
   } else { 
      $('#new_topic').fadeOut('fast'); 
      $('#new_synapse').fadeOut('fast'); 
      // reset the draw synapse positions to false
      MetamapsModel.synapseStartCoord = false;
      MetamapsModel.synapseEndCoord = false;
      // set all node dimensions back to normal
       Mconsole.graph.eachNode(function (n) {
          n.setData('dim', 25, 'current');
       });
      tempInit = false; 
      tempNode = null; 
      tempNode2 = null; 
      Mconsole.plot(); 
   } 
}//canvasDoubleClickHandler 

function handleSelectionBeforeDragging(node, e) {
  // four cases:
  // 1 nothing is selected, so pretend you aren't selecting
  // 2 others are selected only and shift, so additionally select this one
  // 3 others are selected only, no shift: drag only this one
  // 4 this node and others were selected, so drag them (just return false)
  //return value: deselect node again after?
  if (MetamapsModel.selectedNodes.length == 0) {
    selectNode(node);
    return 'deselect';
  }
  if (MetamapsModel.selectedNodes.indexOf(node) == -1) {
    if (e.shiftKey) {
      selectNode(node);
      return 'nothing';
    } else {
      return 'only-drag-this-one';
    }
  }
  return 'nothing'; //case 4?
}

function onDragMoveTopicHandler(node, eventInfo, e) {
    if (node && !node.nodeFrom) {
       $('#new_synapse').fadeOut('fast');
       $('#new_topic').fadeOut('fast');
       var pos = eventInfo.getPos();
       // if it's a left click, or a touch, move the node
       if ( e.touches || (e.button == 0 && !e.altKey && (e.buttons == 0 || e.buttons == 1 || e.buttons == undefined))) {
           //if the node dragged isn't already selected, select it
           var whatToDo = handleSelectionBeforeDragging(node, e);
           if (whatToDo == 'only-drag-this-one' || whatToDo == 'deselect') {
             if (gType == "centered") {
               var rho = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
               var theta = Math.atan2(pos.y, pos.x);
               node.pos.setp(theta, rho);
             }
             else {
               node.pos.setc(pos.x,pos.y);
               node.setData('xloc', pos.x);
               node.setData('yloc', pos.y);
             }
           } else {
             var len = MetamapsModel.selectedNodes.length;

             //first define offset for each node
             var xOffset = new Array();
             var yOffset = new Array();
             for (var i = 0; i < len; i += 1) {
               var n = MetamapsModel.selectedNodes[i];
               if (gType == "centered") {
                 xOffset[i] = n.pos.toComplex().x - node.pos.toComplex().x;
                 yOffset[i] = n.pos.toComplex().y - node.pos.toComplex().y;
               }
               else {
                 xOffset[i] = n.pos.x - node.pos.x;
                 yOffset[i] = n.pos.y - node.pos.y;
               }
             }//for

             for (var i = 0; i < len; i += 1) {
               var n = MetamapsModel.selectedNodes[i];
               if (gType == "centered") {
                 var x = pos.x + xOffset[i];
                 var y = pos.y + yOffset[i];
                 var rho = Math.sqrt(x * x + y * y);
                 var theta = Math.atan2(y, x);
                 n.pos.setp(theta, rho);
               }
               else {
                 var x = pos.x + xOffset[i];
                 var y = pos.y + yOffset[i];
                 n.pos.setc(x,y);
                 n.setData('xloc', pos.x);
                 n.setData('yloc', pos.y);
               }
               n.setData('xloc', x);
               n.setData('yloc', y);
             }//for
           }//if

           if (whatToDo == 'deselect') {
             deselectNode(node);
           }
           dragged = node.id;
           Mconsole.plot();
       }
       // if it's a right click or holding down alt, start synapse creation  ->third option is for firefox
       else if ((e.button == 2 || (e.button == 0 && e.altKey) || e.buttons == 2) && userid != null) {
           if (tempInit == false) {
              tempNode = node;
              tempInit = true;
              // set the draw synapse start position
              MetamapsModel.synapseStartCoord = {
                x: node.pos.getc().x,
                y: node.pos.getc().y
              };
           }
           //
           temp = eventInfo.getNode();
           if (temp != false && temp.id != node.id) { // this means a Node has been returned
              tempNode2 = temp;
              
              // set the draw synapse end position
              MetamapsModel.synapseEndCoord = {
                x: temp.pos.getc().x,
                y: temp.pos.getc().y
              };
              
              Mconsole.plot();
              
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
              // set the draw synapse end position
              MetamapsModel.synapseEndCoord = {
                x: eventInfo.getPos().x,
                y: eventInfo.getPos().y
              };
              Mconsole.plot();
              Mconsole.fx.plotNode(tempNode, Mconsole.canvas);
           }
       }
   }
}

var lastDist = 0;

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
}

function touchPanZoomHandler(eventInfo, e) {
    if (e.touches.length == 1) {
        var thispos = touchPos, 
        currentPos = eventInfo.getPos(),
        canvas = Mconsole.canvas,
        ox = canvas.translateOffsetX,
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY;
        currentPos.x *= sx;
        currentPos.y *= sy;
        currentPos.x += ox;
        currentPos.y += oy;
        //var x = currentPos.x - thispos.x,
        //    y = currentPos.y - thispos.y;
        var x = currentPos.x - thispos.x,
            y = currentPos.y - thispos.y;
        touchPos = currentPos;
        Mconsole.canvas.translate(x * 1/sx, y * 1/sy);
    }
    else if (e.touches.length == 2) {
        var touch1 = e.touches[0];
        var touch2 = e.touches[1];

          var dist = getDistance({
            x: touch1.clientX,
            y: touch1.clientY
          }, {
            x: touch2.clientX,
            y: touch2.clientY
          });
    
          if(!lastDist) {
            lastDist = dist;
          }
    
          var scale = dist / lastDist;
            
          console.log(scale);
          
            if (8 >= Mconsole.canvas.scaleOffsetX*scale && Mconsole.canvas.scaleOffsetX*scale >= 1) {
              Mconsole.canvas.scale(scale, scale);
            }
            if (Mconsole.canvas.scaleOffsetX < 0.5) {
                Mconsole.canvas.viz.labels.hideLabels(true);
            }
            else if (Mconsole.canvas.scaleOffsetX > 0.5) {
                Mconsole.canvas.viz.labels.hideLabels(false);
            }
            lastDist = dist;
    }
    
}

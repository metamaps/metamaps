function selectEdgeOnClickHandler(adj, e) {
  
  if (Mconsole.busy) return;
  
  //editing overrides everything else
  if (e.altKey) {
    //in select-edit-delete-nodes-and-edges.js
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

function nodeDoubleClickHandler(node, e) {
  node.setData('inCommons', false);
  deselectNode(node);
  console.log("Here's the node you clicked:");
  console.log(node);
  if ($('.maps.onMap').length > 0) {
    //TODO  var mappingId = createAMapping(alert('unimp'));
    //node.setData('mappingid', mappingId);
  }
}//doubleClickNodeHandler

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

function selectNode(node) {
  node.selected = true;
  node.setData('dim', 30, 'current');
  node.setData('onCanvas',true);
  node.eachAdjacency(function (adj) {
    selectEdge(adj);
  });
}

function deselectNode(node) {
  delete node.selected;
  node.setData('onCanvas', false);
  node.eachAdjacency(function(adj) {
    deselectEdge(adj);
  });
  node.setData('dim', 25, 'current');
}

function selectNodeOnClickHandler(node, e) {
  if (Mconsole.busy) return;

  if (nodeWasDoubleClicked()) {
    nodeDoubleClickHandler(node, e);
    return;
  }
  
  if (gType != "centered") {
      //set final styles
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
}//selectNodeOnClickHandler

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
      $('#topic_name').autocomplete('enable');      
      $('#new_topic').fadeIn('fast'); 
      addMetacode(); 
      $('#topic_name').focus(); 
   } else { 
      $('#new_topic').fadeOut('fast'); 
      $('#new_synapse').fadeOut('fast'); 
      tempInit = false; 
      tempNode = null; 
      tempNode2 = null; 
      Mconsole.plot(); 
   } 
}//canvasDoubleClickHandler 

function onDragMoveTopicHandler(node, eventInfo, e) {
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

function centerOn(nodeid) {
  if (!Mconsole.busy) {
          var node = Mconsole.graph.getNode(nodeid);
          $('div.index img').attr('src', imgArray[node.getData('metacode')].src);
          $('div.index .mapName').html(node.name);
          $(document).attr('title', node.name + ' | Metamaps');
          window.history.pushState(node.name, "Metamaps", "/topics/" + node.id);
          Mconsole.onClick(node.id, {  
            hideLabels: false,
            duration: 1000,
            onComplete: function() {
              fetchRelatives(node);
            }            
          });
        }
}

function editEdge(edge, e) {
  if (authorizeToEdit(edge)) {
    //reset so we don't interfere with other edges, but first, save its x and y 
    var myX = $('#edit_synapse').css('left');
    var myY = $('#edit_synapse').css('top');
    $('#edit_synapse').remove();

    //so label is missing while editing
    deselectEdge(edge);

    //create the wrapper around the form elements, including permissions
    //classes to make best_in_place happy
    var edit_div = document.createElement('div');
    edit_div.setAttribute('id', 'edit_synapse');
    edit_div.className = 'permission canEdit';
    $('.main .wrapper').append(edit_div);

    populateEditEdgeForm(edge);

    //drop it in the right spot, activate it
    $('#edit_synapse').css('position', 'absolute');
    if (e) {
      $('#edit_synapse').css('left', e.clientX);
      $('#edit_synapse').css('top', e.clientY);
    }
    else {
      $('#edit_synapse').css('left', myX);
      $('#edit_synapse').css('top', myY);
    }
    //$('#edit_synapse_name').click(); //required in case name is empty
    //$('#edit_synapse_name input').focus();
    $('#edit_synapse').show();
    
    MetamapsModel.edgecardInUse = edge.data.$id;
  }
  else if ((! authorizeToEdit(edge)) && userid) {
    alert("You don't have the permissions to edit this synapse.");
  }
}

function populateEditEdgeForm(edge) {
  add_perms_form(edge);
  add_direction_form(edge);
  add_name_form(edge);
}

function add_name_form(edge) {
  var data_nil = '<span class="gray">Click to add description.</span>';
  //name editing form
  $('#edit_synapse').append('<div id="edit_synapse_name"></div>');
  $('#edit_synapse_name').attr('class', 'best_in_place best_in_place_desc');
  $('#edit_synapse_name').attr('data-object', 'synapse');
  $('#edit_synapse_name').attr('data-attribute', 'desc');
  $('#edit_synapse_name').attr('data-type', 'input');
  $('#edit_synapse_name').attr('data-nil', data_nil);
  $('#edit_synapse_name').attr('data-url', '/synapses/' + edge.getData("id"));
  $('#edit_synapse_name').html(edge.getData("desc"));

  //if edge data is blank or just whitespace, populate it with data_nil
  if ($('#edit_synapse_name').html().trim() == '') {
    $('#edit_synapse_name').html(data_nil);
  }

  $('#edit_synapse_name').bind("ajax:success", function() {
    var desc = $(this).html();
    if (desc == data_nil) {
      edge.setData("desc", '');
    } else {
      edge.setData("desc", desc);
    }
    selectEdge(edge);
    Mconsole.plot();
  });
}

function add_perms_form(edge) {
  //permissions - if owner, also allow permission editing
  $('#edit_synapse').append('<div class="mapPerm"></div>');
  $('#edit_synapse .mapPerm').html(mk_permission(edge));
  if (userid == edge.getData('userid')) {
    $('#edit_synapse').append('<div class="permActivator" />');
    $('#edit_synapse .permActivator').append('<div class="editSettings" />');
    $('#edit_synapse .editSettings').append('<span>Permissions:</span>');
    $('#edit_synapse .editSettings').append('<span class="click-to-edit" />');
    $('#edit_synapse .click-to-edit').attr('title', 'Click to Edit');
    $('#edit_synapse .click-to-edit').append(best_in_place_perms(edge));
    $('#edit_synapse .editSettings').append('<div class="clearfloat" />');

    $('#edit_synapse').find('.best_in_place_permission').bind("ajax:success", function() {
      var permission = $(this).html();
      switch(permission) {
        case 'commons': $('#edit_synapse .mapPerm').html('co'); break;
        case 'public': $('#edit_synapse .mapPerm').html('pu'); break;
        case 'private': $('#edit_synapse .mapPerm').html('pr'); break;
      }//switch
    });
 
    $('#edit_synapse .permActivator').bind('mouseover', function() {
      clearTimeout(MetamapsModel.edgePermTimer2);
      that = this;
      MetamapsModel.edgePermTimer1 = setTimeout(function() {
        if (! MetamapsModel.edgePermSliding) {
          MetamapsModel.edgePermSliding = true;
            $(that).animate({
              width: '203px',
              height: '37px'
            }, 300, function() {
              MetamapsModel.edgePermSliding = false;
            });
        }
      }, 300);
    });
    $('#edit_synapse .permActivator').bind('mouseout', function () {
        clearTimeout(MetamapsModel.edgePermTimer1);
        that = this;
        MetamapsModel.edgePermTimer2 = setTimeout(function() {
          if (! MetamapsModel.edgePermSliding) {
            MetamapsModel.edgePermSliding = true;
            $(that).animate({
              height: '16px',
              width: '16px'
            }, 300, function() {
              MetamapsModel.edgePermSliding = false;
            });
          }
        },800);
      }
    );
  }
}//add_perms_form

function add_direction_form(edge) {
  //directionality checkboxes
  $('#edit_synapse').append('<input type="checkbox" id="edit_synapse_left">');
  $('#edit_synapse').append('<label class="left">&lt;</label>');
  $('#edit_synapse').append('<input type="checkbox" id="edit_synapse_right">');
  $('#edit_synapse').append('<label class="right">&gt;</label>');

  //determine which node is to the left and the right
  //if directly in a line, top is left
  if (edge.nodeFrom.pos.x < edge.nodeTo.pos.x ||
      edge.nodeFrom.pos.x == edge.nodeTo.pos.x &&
      edge.nodeFrom.pos.y < edge.nodeTo.pos.y) {
    var left = edge.nodeTo;
    var right = edge.nodeFrom;
  } else {
    var left = edge.nodeFrom;
    var right = edge.nodeTo;
  }

  /*
   * One node is actually on the left onscreen. Call it left, & the other right.
   * If category is from-to, and that node is first, check the 'right' checkbox.
   * Else check the 'left' checkbox since the arrow is incoming.
   */

  var directionCat = edge.getData('category'); //both, none, from-to
  if (directionCat == 'from-to') {
    var from_to = edge.getData('direction');
    if (from_to[0] == left.id) {
      //check left checkbox
      $('#edit_synapse_left').prop('checked', true);
    } else {
      //check right checkbox
      $('#edit_synapse_right').prop('checked', true);
    }
  } else if (directionCat == 'both') {
    //check both checkboxes
    $('#edit_synapse_left').prop('checked', true);
    $('#edit_synapse_right').prop('checked', true);
  }
  $('#edit_synapse_left, #edit_synapse_right').click(function() {
    var leftChecked = $('#edit_synapse_left').is(':checked');
    var rightChecked = $('#edit_synapse_right').is(':checked');

    var dir = edge.getData('direction');
    var dirCat = 'none';
    if (leftChecked && rightChecked) {
      dirCat = 'both';
    } else if (!leftChecked && rightChecked) {
      dirCat = 'from-to';
      dir = [right.id, left.id];
    } else if (leftChecked && !rightChecked) {
      dirCat = 'from-to';
      dir = [left.id, right.id];
    }
    $.ajax({
      'type': 'PUT',
      'url': '/synapses/' + edge.getData('id'),
      'data': {
        synapse: {
          category:dirCat
        },
        node1_id: {
          node1: dir[0]
        },
        node2_id: {
          node2: dir[1]
        }
      },
      'success': function(data) {
        updateEdgeDisplay(edge, dir, dirCat);
      }
    });
  });
}//add_direction_form

function updateEdgeDisplay(edge, dir, dirCat) {
  edge.setData('category', dirCat);
  edge.setData('direction', dir);

  //render mid arrow
  //renderEdgeArrows(Mconsole.fx.edgeHelper, edge);
  Mconsole.plot();
}

function best_in_place_perms(edge) {
  var output = 
  '<span class="best_in_place best_in_place_permission"                       \
        id="best_in_place_topic_$_id_$_permission"                            \
        data-url="/synapses/$_id_$"                                           \
        data-object="synapse"                                                 \
        data-collection=$_permission_choices_$                                \
        data-attribute="permission"                                           \
        data-type="select"                                                    \
        data-value="$_current_$">$_perm_$</span>';

  var permission_choices = "'[";
  permission_choices += '["commons","commons"],';
  permission_choices += '["public","public"],';
  permission_choices += '["private","private"]';
  permission_choices += "]'";

  output = output.replace(/\$_permission_choices_\$/g, permission_choices);
  output = output.replace(/\$_id_\$/g, edge.getData('id'));
  output = output.replace(/\$_current_$\$/g, edge.getData('permission'));
  output = output.replace(/\$_perm_\$/g, edge.getData('permission'));
  return output;
}//best_in_place_perms

function deselectAllEdges() {
  var l = MetamapsModel.selectedEdges.length;
  for (var i = l-1; i >= 0; i -= 1) {
    var edge = MetamapsModel.selectedEdges[i];
    deselectEdge(edge);
  }
}

function deselectAllNodes() {
  var l = MetamapsModel.selectedNodes.length;
  for (var i = l-1; i >= 0; i -= 1) {
    var node = MetamapsModel.selectedNodes[i];
    deselectNode(node);
  }
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
  var l = MetamapsModel.selectedEdges.length;
  for (var i = l-1; i >= 0; i -= 1) {
    var edge = MetamapsModel.selectedEdges[i];
    hideEdge(edge);
  }
  MetamapsModel.selectedEdges = new Array();
}

function removeSelectedEdges() {
  var l = MetamapsModel.selectedEdges.length;
  for (var i = l-1; i >= 0; i -= 1) {
    if (mapid != null) {
      var edge = MetamapsModel.selectedEdges[i];
      var id = edge.getData("id");
      //delete mapping of id mapid
      $.ajax({
        type: "POST",
        url: "/synapses/" + mapid + "/" + id + "/removefrommap",
      });
    }
    hideEdge(edge);
  }
  MetamapsModel.selectedEdges = new Array();
}

function deleteSelectedEdges() {
  var l = MetamapsModel.selectedEdges.length;
  for (var i = l-1; i >= 0; i -= 1) {
    var edge = MetamapsModel.selectedEdges[i];
    var id = edge.getData("id");
    $.ajax({
      type: "DELETE",
      url: "/synapses/" + id,
    });
    hideEdge(edge);
  }
  MetamapsModel.selectedEdges = new Array();
}

function selectNode(node) {
  if (MetamapsModel.selectedNodes.indexOf(node) != -1) return;
  node.selected = true;
  node.setData('dim', 30, 'current');
  node.setData('whiteCircle',true);
  node.eachAdjacency(function (adj) {
    selectEdge(adj);
  });
  MetamapsModel.selectedNodes.push(node);
}

function deselectNode(node) {
  delete node.selected;
  node.setData('whiteCircle', false);
  node.eachAdjacency(function(adj) {
    deselectEdge(adj);
  });
  node.setData('dim', 25, 'current');

  //remove the node
  MetamapsModel.selectedNodes.splice(
    MetamapsModel.selectedNodes.indexOf(node), 1);
}

function selectEdge(edge) {
  if (MetamapsModel.selectedEdges.indexOf(edge) != -1) return;
  edge.setData('showDesc', true, 'current');
  if ( ! MetamapsModel.embed) {
    edge.setDataset('end', {
      lineWidth: 4,
      color: '#FFFFFF',
      alpha: 1
    });
  } else if (MetamapsModel.embed) {
    edge.setDataset('end', {
      lineWidth: 4,
      color: '#999',
      alpha: 1
    });
  }
  Mconsole.fx.animate({
    modes: ['edge-property:lineWidth:color:alpha'],
    duration: 100
  });
  MetamapsModel.selectedEdges.push(edge);
}

function deselectEdge(edge) {
  edge.setData('showDesc', false, 'current');
  edge.setDataset('end', {
    lineWidth: 2,
    color: '#222222',
    alpha: 0.4
  });

  if (MetamapsModel.edgeHoveringOver == edge) {
    edge.setData('showDesc', true, 'current');
    edge.setDataset('end', {
      lineWidth: 4,
      color: '#222222',
      alpha: 1
    });
  }

  Mconsole.fx.animate({
    modes: ['edge-property:lineWidth:color:alpha'],
    duration: 100
  });

  //remove the edge
  MetamapsModel.selectedEdges.splice(
    MetamapsModel.selectedEdges.indexOf(edge), 1);
}

// this is for hiding one topic from your canvas
function hideNode(nodeid) {
  var node = Mconsole.graph.getNode(nodeid);
  if (nodeid == Mconsole.root && gType == "centered") {
    alert("You can't hide this topic, it is the root of your graph.");
    return;
  }

  deselectNode(node);
  
  node.setData('alpha', 0, 'end');  
  node.eachAdjacency(function(adj) {  
	adj.setData('alpha', 0, 'end');  
  });  
  Mconsole.fx.animate({  
	modes: ['node-property:alpha',  
			'edge-property:alpha'],  
	duration: 1000  
  });
  Mconsole.graph.removeNode(nodeid);
}

function hideSelectedNodes() {
  var l = MetamapsModel.selectedNodes.length;
  for (var i = l-1; i >= 0; i -= 1) {
    var node = MetamapsModel.selectedNodes[i];
    hideNode(node.id);
  }
}

function removeNode(nodeid) {
  var node = Mconsole.graph.getNode(nodeid);
  deselectNode(node);
  if (mapperm) {
    $.ajax({
      type: "POST",
      url: "/topics/" + mapid + "/" + nodeid + "/removefrommap",
    });
  }
}
function removeSelectedNodes() {
 if (mapperm) {
    var l = MetamapsModel.selectedNodes.length;
    for (var i = l-1; i >= 0; i -= 1) {
      var node = MetamapsModel.selectedNodes[i];
      removeNode(node.id);
    }
  }
}

function deleteNode(nodeid) {
  if (nodeid == Mconsole.root && gType == "centered") {
    alert("You can't delete this topic, it is the root of your graph.");
    return;
  }
  $.ajax({
    type: "DELETE",
    url: "/topics/" + nodeid,
  });
}
function deleteSelectedNodes() {
  var l = MetamapsModel.selectedNodes.length;
  for (var i = l-1; i >= 0; i -= 1) {
    var node = MetamapsModel.selectedNodes[i];
    deleteNode(node.id);
  }
}

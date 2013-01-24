function editEdge(edge, e) {
  if (authorizeToEdit(edge)) {
      //reset so we don't interfere with other edges
      $('#edit_synapse').remove();

      deselectEdge(edge); //so the label is missing while editing
      var perm = document.createElement('div');
      perm.className = 'permission canEdit';
      var edit_div = document.createElement('div');
      edit_div.setAttribute('id', 'edit_synapse');
      perm.appendChild(edit_div);
      $('.main .wrapper').append(perm);
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
        $('#edit_synapse').hide();
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
  else if ((! authorizeToEdit(edge)) && userid) {
    alert("You don't have the permissions to edit this synapse.");
  }
}

function deselectAllEdges() {
  for (var i = 0; i < MetamapsModel.selectedEdges.length; i += 1) {
    var edge = MetamapsModel.selectedEdges[i];
    deselectEdge(edge);
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
  for (var i = 0; i < MetamapsModel.selectedEdges.length; i += 1) {
    var edge = MetamapsModel.selectedEdges[i];
    hideEdge(edge);
  }
  MetamapsModel.selectedEdges = new Array();
}

function removeSelectedEdges() {
  for (var i = 0; i < MetamapsModel.selectedEdges.length; i += 1) {
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
  for (var i = 0; i < MetamapsModel.selectedEdges.length; i += 1) {
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
  MetamapsModel.selectedEdges.push(edge);
}

function deselectEdge(edge) {
  var showDesc = edge.getData("showDesc");
  if (showDesc) {
    edge.setData('showDesc', false, 'current');
    edge.setDataset('end', {
      lineWidth: 2,
      color: '#222222'
    });

    if (MetamapsModel.edgeHoveringOver == edge) {
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

  //remove the edge
  MetamapsModel.selectedEdges.splice(
    MetamapsModel.selectedEdges.indexOf(edge), 1);
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

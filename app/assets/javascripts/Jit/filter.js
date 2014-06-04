// create filters for maps

function switchVisible(category, duration) {
	if (categoryVisible[category] == true) {
		hideCategory(category, duration);
	}
	else if (categoryVisible[category] == false) {
		showCategory(category, duration);
	}
}

function hideCategory(category, duration) {
    if (duration == null) duration = 500;
	Mconsole.graph.eachNode( function (n) {
		if (n.getData('metacode') == category) {
			n.setData('alpha', 0.4, 'end');
			n.eachAdjacency(function(adj) {  
			adj.setData('alpha', 0.4, 'end');  
		  	});	
		}	
	});
	Mconsole.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	}); 	
}

function showCategory(category, duration) {
    if (duration == null) duration = 500;
	Mconsole.graph.eachNode( function (n) {
		if (n.getData('metacode') == category) {
			n.setData('alpha', 1, 'end');
			n.eachAdjacency(function(adj) {  
			adj.setData('alpha', 1, 'end');  
		  	});	
		}	
	});
	Mconsole.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	});	
}

// These functions toggle ALL nodes and synapses on the page
function hideAll(duration) {
    if (duration == null) duration = 500;
	Mconsole.graph.eachNode( function (n) {
		  n.setData('alpha', 0.4, 'end');
      n.eachAdjacency(function(adj) {  
        adj.setData('alpha', 0.2, 'end');  
      });        
	});
	Mconsole.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	}); 	
}
function showAll(duration) {
    if (duration == null) duration = 500;
	Mconsole.graph.eachNode( function (n) {
		  n.setData('alpha', 1, 'end');
		  n.eachAdjacency(function(adj) {  
		    adj.setData('alpha', 0.4, 'end');  
		  });	
	});
	Mconsole.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	});	
}

function filterTopicsByMap(mapID) {
  Mconsole.graph.eachNode(function (n) {
    if (n.getData('inmaps').indexOf(parseInt(mapID)) !== -1) {
      n.setData('alpha', 1, 'end');
    }
    else {
      n.setData('alpha', 0.4, 'end');
    }
    Mconsole.fx.animate({  
		  modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		  duration: 500  
	  });	
  }); 
} // filterTopicsByName

function filterTopicsByMapper(mapperID) {
  Mconsole.graph.eachNode(function (n) {
    if (n.getData('userid').toString() == mapperID) {
      n.setData('alpha', 1, 'end');
    }
    else {
      n.setData('alpha', 0.4, 'end');
    }
    Mconsole.fx.animate({  
		  modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		  duration: 500  
	  });	
  }); 
} // filterTopicsByName

function filterTopicsByName(searchQuery) {
  Mconsole.graph.eachNode(function (n) {
    nodeName = n.name.toLowerCase();
    if (nodeName.indexOf(searchQuery) !== -1 && searchQuery != "") {
      n.setData('alpha', 1, 'end');
    }
    else {
      n.setData('alpha', 0.4, 'end');
    }
    Mconsole.fx.animate({  
		  modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		  duration: 500  
	  });	
  }); 
} // filterTopicsByName

function clearCanvas() {
  Mconsole.graph.eachNode(function(n) {
    Mconsole.graph.removeNode(n.id);
  });
  Mconsole.plot();
}

function clearCanvasExceptRoot() {
  var ids = new Array();
  Mconsole.graph.eachNode(function(n) {
    ids.push(n.id);
  });

  var root = Mconsole.graph.nodes[Mconsole.root];
  ids.forEach(function(id, index) {
    if (id != root.id) {
      Mconsole.graph.removeNode(id);
    }
  });
  fetchRelatives(root); //also runs Mconsole.plot()
}

/**
 * Define all the dynamic interactions for the Filter By Metacode using Jquery
 */
  
$(document).ready(function() {
  $('.sidebarFilterBox .showAll').click(function(e) {
        showAll();
        $('#filter_by_metacode ul li').removeClass('toggledOff');
        for (var catVis in categoryVisible) {
          categoryVisible[catVis] = true;
        }
  });
  $('.sidebarFilterBox .hideAll').click(function(e) {
        hideAll();
        $('#filter_by_metacode ul li').addClass('toggledOff');
        for (var catVis in categoryVisible) {
          categoryVisible[catVis] = false;
        }
  });
  
  // toggle visibility of topics with metacodes based on status in the filters list
  $('#filter_by_metacode ul li').click(function(event) {
      
      var category = $(this).children('img').attr('alt');
      switchVisible(category);
  
      // toggle the image and the boolean array value
      if (categoryVisible[category] == true) {
        $(this).addClass('toggledOff');
        categoryVisible[category] = false;
      }
      else if (categoryVisible[category] == false) {
        $(this).removeClass('toggledOff');
        categoryVisible[category] = true;
      }
  });
});
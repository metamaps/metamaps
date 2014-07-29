function fetchRelatives(node) {
    var myA = $.ajax({
        type: "Get",
        url: "/topics/" + node.id + "?format=json",
        success: function (data) {
            if (gType == "centered") {
                Mconsole.busy = true;
                Mconsole.op.sum(data, {
                    type: 'fade',
                    duration: 500,
                    hideLabels: false
                });
                Mconsole.graph.eachNode(function (n) {
                    n.eachAdjacency(function (a) {
                        if (!a.getData('showDesc')) {
                            a.setData('alpha', 0.4, 'start');
                            a.setData('alpha', 0.4, 'current');
                            a.setData('alpha', 0.4, 'end');
                        }
                    });
                });
                Mconsole.busy = false;
            } else {
                Mconsole.op.sum(data, {
                    type: 'nothing',
                });
                Mconsole.plot();
            }
        },
        error: function () {
            alert('failure');
        }
    });
}

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
            onComplete: function () {
                fetchRelatives(node);
            }
        });
    }
}



function MconsoleReset() {

    var tX = Mconsole.canvas.translateOffsetX;
    var tY = Mconsole.canvas.translateOffsetY;
    Mconsole.canvas.translate(-tX, -tY);

    var mX = Mconsole.canvas.scaleOffsetX;
    var mY = Mconsole.canvas.scaleOffsetY;
    Mconsole.canvas.scale((1 / mX), (1 / mY));
}


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
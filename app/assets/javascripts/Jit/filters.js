// create filters for maps, and for card views

//  keep an array of which item categories are currently visible.
var categoryVisible = new Object();

categoryVisible['Group'] = true; 
categoryVisible['Person'] = true; 
categoryVisible['Bizarre'] = true; 
categoryVisible['Catalyst'] = true; 
categoryVisible['Closed'] = true; 
categoryVisible['Experience'] = true; 
categoryVisible['Future Dev'] = true; 
categoryVisible['Idea'] = true; 
categoryVisible['Implication'] = true; 
categoryVisible['Insight'] = true; 
categoryVisible['Intention'] = true; 
categoryVisible['Knowledge'] = true; 
categoryVisible['Location'] = true; 
categoryVisible['Open Issue'] = true; 
categoryVisible['Opinion'] = true; 
categoryVisible['Opportunity'] = true; 
categoryVisible['Platform'] = true; 
categoryVisible['Problem'] = true; 
categoryVisible['Question'] = true; 
categoryVisible['Reference'] = true; 
categoryVisible['Requirement'] = true; 
categoryVisible['Resource'] = true; 
categoryVisible['Role'] = true; 
categoryVisible['Task'] = true; 
categoryVisible['Tool'] = true; 
categoryVisible['Trajectory'] = true; 
categoryVisible['Action'] = true; 
categoryVisible['Activity'] = true; 

function switchVisible(g, category, duration) {
	if (categoryVisible[category] == true) {
		hideCategory(g, category, duration);
	}
	else if (categoryVisible[category] == false) {
		showCategory(g, category, duration);
	}
}

function hideCategory(g, category, duration) {
    if (duration == null) duration = 500;
	g.graph.eachNode( function (n) {
		if (n.getData('itemcatname') == category) {
			n.setData('alpha', 0, 'end');
			n.eachAdjacency(function(adj) {  
			adj.setData('alpha', 0, 'end');  
		  	});	
		}	
	});
	g.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	}); 	
}

function showCategory(g, category, duration) {
    if (duration == null) duration = 500;
	g.graph.eachNode( function (n) {
		if (n.getData('itemcatname') == category) {
			n.setData('alpha', 1, 'end');
			n.eachAdjacency(function(adj) {  
			adj.setData('alpha', 1, 'end');  
		  	});	
		}	
	});
	g.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	});	
}

function hideAll(g, duration) {
    if (duration == null) duration = 500;
	g.graph.eachNode( function (n) {
		  n.setData('alpha', 0, 'end');
		  n.eachAdjacency(function(adj) {  
		  adj.setData('alpha', 0, 'end');  
		  });	
	});
	g.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	}); 	
}

function showAll(g, duration) {
    if (duration == null) duration = 500;
	g.graph.eachNode( function (n) {
		  n.setData('alpha', 1, 'end');
		  n.eachAdjacency(function(adj) {  
		  adj.setData('alpha', 1, 'end');  
		  });	
	});
	g.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	});	
}

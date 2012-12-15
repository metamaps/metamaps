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
		if (n.getData('itemcatname') == category) {
			n.setData('alpha', 0, 'end');
			n.eachAdjacency(function(adj) {  
			adj.setData('alpha', 0, 'end');  
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
		if (n.getData('itemcatname') == category) {
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

function hideAll(duration) {
    if (duration == null) duration = 500;
	Mconsole.graph.eachNode( function (n) {
		  n.setData('alpha', 0, 'end');
		  n.eachAdjacency(function(adj) {  
		  adj.setData('alpha', 0, 'end');  
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
		  adj.setData('alpha', 1, 'end');  
		  });	
	});
	Mconsole.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: duration  
	});	
}

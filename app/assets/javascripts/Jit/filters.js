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




// Define the Find/Filters possibilities

var findTopics = ['name','metacode', 'mapper (by name)', 'map (by name)']
var findSynapses = ['topics (by name)', 'directionality', 'mapper (by name)', 'map (by name)']
var findMaps = ['name', 'topic (by name)', 'mapper (by name)', 'synapse (by topics)']
var findMappers = ['name', 'topic (by name)', 'map (by name)', 'synapse (by topics)']





// These functions toggle ALL nodes and synapses on the page
function hideAll(duration) {
    if (duration == null) duration = 500;
	Mconsole.graph.eachNode( function (n) {
		  n.setData('alpha', 0.4, 'end');
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




/// Traverse the Graph and only show the searched for nodes

function onCanvasSearch(name,mapID,mapperID) {

	Mconsole.graph.eachNode( function (n) {
		  if (name != null) {
		     if (n.name.indexOf(name) !== -1) {
				 n.setData('alpha', 1, 'end');
				 n.eachAdjacency(function(adj) {  
				   adj.setData('alpha', 0.4, 'end');  
				 });
		     }
			 else {
				 n.setData('alpha', 0.4, 'end');
				 n.eachAdjacency(function(adj) {  
				   adj.setData('alpha', 0.4, 'end');  
				 }); 
			 }
		  }
		  else if (mapID != null) {
		     if (n.getData('inmaps').indexOf(parseInt(mapID)) !== -1) {
				 n.setData('alpha', 1, 'end');
				 n.eachAdjacency(function(adj) {  
				   adj.setData('alpha', 0.4, 'end');  
				 });
		     }
			 else {
				 n.setData('alpha', 0.4, 'end');
				 n.eachAdjacency(function(adj) {  
				   adj.setData('alpha', 0.4, 'end');  
				 }); 
			 }
		  }
		  else if (mapperID != null) {
		     if (n.getData('userid').toString() == mapperID) {
			    n.setData('alpha', 1, 'end');
		        n.eachAdjacency(function(adj) {  
		           adj.setData('alpha', 0.4, 'end');  
		        });
			 }
			 else {
				 n.setData('alpha', 0.4, 'end');
				 n.eachAdjacency(function(adj) {  
				   adj.setData('alpha', 0.4, 'end');  
				 }); 
			 }
		  }
	});
	Mconsole.fx.animate({  
		modes: ['node-property:alpha',  
				'edge-property:alpha'],  
		duration: 500  
	});	
}






////
////
////
//// Define all the dynamic interactions for the FIND/FILTER using Jquery

$(document).ready(function() {
   
   // this sets up the initial opening of the find box
   $('.sideOption').bind('click',function(){
	  $('.sideOption').animate({
		width: '305px',
		height: '76px'
	  }, 700, function() {
		$('#topic_by_name_input').focus();
	  });
	  $('#closeFind, #findWhere').css('display','block');
	  $('.sideOption').unbind('click');
	  $('.sideOption').css('cursor','default');
   });
   
   // this sets up the closing of the find box, and the toggling between open and closed.
   $('#closeFind').click(function(){
	   $('#closeFind, #findWhere').css('display','none');
	   $('.sideOption').css('cursor','pointer');
	   $('.sideOption').animate({
		width: '45px',
		height: '32px'
	  }, 700, function() {
		    $('.sideOption').bind('click',function(){
				  firstVal = $('.sideOption option[value="name"]').attr('selected');
				  secondVal = $('.sideOption option[value="metacode"]').attr('selected');
				  thirdVal = $('.sideOption option[value="map (by name)"]').attr('selected');
				  fourthVal = $('.sideOption option[value="mapper (by name)"]').attr('selected');
				  if ( firstVal === 'selected' || thirdVal === 'selected' || fourthVal === 'selected' ) {
					  $('.sideOption').animate({
						width: '305px',
					    height: '76px'
					  }, 300, function() {
						$('#topic_by_name_input').focus();
					  });
				  } else if ( secondVal === 'selected') {
					  $('.sideOption').animate({
						width: '380px',
						height: '463px'
					  }, 300, function() {
						// Animation complete.
					  });
				  } else if ( thirdVal === 'selected' ) {
					  $('.sideOption').animate({
						width: '305px',
					    height: '76px'
					  }, 300, function() {
						$('#map_by_name_input').focus();
					  });
				  } else if ( fourthVal === 'selected' ) {
					  $('.sideOption').animate({
						width: '305px',
					    height: '76px'
					  }, 300, function() {
						$('#mapper_by_name_input').focus();
					  });
				  }
				  $('#closeFind, #findWhere').css('display','block');
				  $('.sideOption').unbind('click');
				  $('.sideOption').css('cursor','default');
			   });
	  });
   });
   
   // this is where interactions within the find box begin
   //
   $("#topic_by_name_input").keyup(function() {
          var topicName = $(this).val();
		  
		  // grab the checkboxes to see if the search is on the canvas, in the commons, or both
		  firstVal = $("#onCanvas").attr('checked');
		  secondVal = $("#inCommons").attr('checked');
		  
		  // only have the autocomplete enabled if they are searching in the commons
		  
		  if (firstVal == "checked" && secondVal == "checked"){
			$('#topic_by_name_input').autocomplete( "option", "disabled", false );
			onCanvasSearch(topicName,null,null);  
		  }
		  else if (firstVal == "checked"){
			$('#topic_by_name_input').autocomplete( "option", "disabled", true );
			onCanvasSearch(topicName,null,null);  
		  }
		  else if (secondVal == "checked"){
			hideAll();
			$('#topic_by_name_input').autocomplete( "option", "disabled", false ); 
		  }
		  else {
			$('#topic_by_name_input').autocomplete( "option", "disabled", true );  
		  }
		  
   });
			
   $('.sideOption .select_content').change(function() {
	      firstVal = $(this).children("option[value='topics']").attr('selected');
		  secondVal = $(this).children("option[value='maps']").attr('selected');
		  thirdVal = $(this).children("option[value='mappers']").attr('selected');
		  if ( firstVal == 'selected') {
			  $('.sideOption .select_type').children("option[value='metacode']").removeAttr('disabled');
			  $('.sideOption .select_type').children("option[value='map (by name)']").removeAttr('disabled');
			  $('.sideOption .select_type').children("option[value='mapper (by name)']").removeAttr('disabled');
			  $('.find').css('display','none');
			  $('.find_topic_by_name').css('display','block');
			  $('#topic_by_name_input').focus();
			  
		  }
		  else if ( secondVal == 'selected' ) {
			  if ( $(".sideOption .select_type").val() != "name") { 
			  	$(".sideOption .select_type").val('name');
			    $('.sideOption').animate({
					width: '305px',
					height: '76px'
				  }, 300, function() {
					// Animation complete.
				  });
			  }
			  $('.sideOption .select_type').children("option[value='metacode']").attr('disabled','disabled');
			  $('.sideOption .select_type').children("option[value='map (by name)']").attr('disabled','disabled');
			  $('.sideOption .select_type').children("option[value='mapper (by name)']").attr('disabled','disabled');
			  $('.find').css('display','none');
			  $('.find_map_by_name').css('display','block');
			  $('#map_by_name_input').focus();
		  }
		  else if ( thirdVal == 'selected' ) {
			  $(".sideOption .select_type").val('name');
			  $('.sideOption .select_type').children("option[value='metacode']").attr('disabled','disabled');
			  $('.sideOption .select_type').children("option[value='map (by name)']").attr('disabled','disabled');
			  $('.sideOption .select_type').children("option[value='mapper (by name)']").attr('disabled','disabled');
			  $('.find').css('display','none');
			  $('.find_mapper_by_name').css('display','block');
			  $('#mapper_by_name_input').focus();
		  }
	});
   
   $('.sideOption .select_type').change(function() {
	      firstVal = $(this).children("option[value='name']").attr('selected');
		  secondVal = $(this).children("option[value='metacode']").attr('selected');
		  thirdVal = $(this).children("option[value='map (by name)']").attr('selected');
		  fourthVal = $(this).children("option[value='mapper (by name)']").attr('selected');
		  if ( firstVal === 'selected') {
			  $('.find').fadeOut('fast', function() {
				  showAll();
				  $('.find_topic_by_metacode ul li').not('#hideAll, #showAll').removeClass('toggledOff');
				  for (var catVis in categoryVisible) {
					  categoryVisible[catVis] = true;
				  }
				  $('.sideOption').animate({
					width: '305px',
					height: '76px'
				  }, 300, function() {
					$('.find_topic_by_name').css('display','block');
					$('#topic_by_name_input').focus();
				  });
			  });
		  }
		  else if ( secondVal === 'selected' ) {
			  $('.find').fadeOut('fast', function() {
				  $('.sideOption').animate({
					width: '380px',
					height: '463px'
				  }, 300, function() {
					$('.find_topic_by_metacode').fadeIn('fast');
				  }); 
			  });
		  }
		  else if ( thirdVal === 'selected' ) {
			  $('.find').fadeOut('fast', function() {
				  $('.sideOption').animate({
					width: '305px',
					height: '76px'
				  }, 300, function() {
					$('.find_map_by_name').css('display','block'); 
					$('#map_by_name_input').focus();
				  });  
			  });
		  }
		  else if ( fourthVal === 'selected' ) {
			  $('.find').fadeOut('fast', function() {
				  $('.sideOption').animate({
					width: '305px',
					height: '76px'
				  }, 300, function() {
					$('.find_mapper_by_name').css('display','block'); 
					$('#mapper_by_name_input').focus();
				  });  
			  });
		  }
	});
   
   $('.find_topic_by_name #topic_by_name_input').bind('railsAutocomplete.select', function(event, data){
      /* Do something here */
      if (data.item.id != undefined) {
        window.open("/items/" + data.item.id)
      }
      $('.find_topic_by_name #topic_by_name_input').val('');
    });
    
    $('.find_topic_by_name').bind('submit', function(event, data){
      event.preventDefault();
    });
	
	$('.find_map_by_name #map_by_name_input').bind('railsAutocomplete.select', function(event, data){
          firstVal = $('.sideOption .select_content').children("option[value='topics']").attr('selected');
		  secondVal = $('.sideOption .select_content').children("option[value='maps']").attr('selected');
		  thirdVal = $('.sideOption .select_content').children("option[value='mappers']").attr('selected');
		  if ( firstVal == 'selected') {
			 onCanvasSearch(null,data.item.id,null);
		  }
		  else if ( secondVal == 'selected' ) {
			 if (data.item.id != undefined) {
                window.open("/maps/" + data.item.id);
             }
             $('.find_map_by_name #map_by_name_input').val('');
		  }
		  else if ( thirdVal == 'selected' ) {

		  }
	});
    
    $('.find_map_by_name').bind('submit', function(event, data){
      event.preventDefault();
    });
	
	$('.find_mapper_by_name #mapper_by_name_input').bind('railsAutocomplete.select', function(event, data){
          firstVal = $('.sideOption .select_content').children("option[value='topics']").attr('selected');
		  secondVal = $('.sideOption .select_content').children("option[value='maps']").attr('selected');
		  thirdVal = $('.sideOption .select_content').children("option[value='mappers']").attr('selected');
		  if ( firstVal == 'selected') {
			 onCanvasSearch(null,null,data.item.id.toString());
		  }
		  else if ( secondVal == 'selected' ) {
			 
		  }
		  else if ( thirdVal == 'selected' ) {
			 if (data.item.id != undefined) {
                window.open("/users/" + data.item.id);
             }
             $('.find_mapper_by_name #mapper_by_name_input').val('');
		  }
    });
    
    $('.find_mapper_by_name').bind('submit', function(event, data){
      event.preventDefault();
    });

	// toggle visibility of item categories based on status in the filters list
	$('.find_topic_by_metacode ul li').click(function(event) {
		obj = document.getElementById('container');
        
		var switchAll = $(this).attr('id');
		
		if ( switchAll === "showAll" || switchAll === "hideAll") {
			if (switchAll == "showAll") {
				// this means that we are on a map view		
				if (obj != null) {
					showAll();
				}
				// this means that we are on a card view
				else {
					$('.item').fadeIn('slow');
				}
				$('.find_topic_by_metacode ul li').not('#hideAll, #showAll').removeClass('toggledOff');
				for (var catVis in categoryVisible) {
					categoryVisible[catVis] = true;
				}
			}
			else if (switchAll == "hideAll") {
				// this means that we are on a map view		
				if (obj != null) {
					hideAll();
				}
				// this means that we are on a card view
				else {
					$('.item').fadeOut('slow');
				}
				$('.find_topic_by_metacode ul li').not('#hideAll, #showAll').addClass('toggledOff');
				for (var catVis in categoryVisible) {
					categoryVisible[catVis] = false;
				}
			}
		}
		else {
			var category = $(this).children('img').attr('alt');
			
			// this means that we are on a map view		
			if (obj != null) {		  
				  switchVisible(category);
			}
			// this means that we are on a card view
			//else {	
//			  if (categoryVisible[category] == true) {
//				  if (category.split(' ').length == 1) {
//					$('#cards .' + category).fadeOut('slow');
//				  }
//				  else {
//					  $('#cards .' + category.split(' ')[0]).fadeOut('slow');
//				  }
//			  }
//			  else if (categoryVisible[category] == false) {
//				  if (category.split(' ').length == 1) {
//					$('#cards .' + category).fadeIn('slow');
//				  }
//				  else {
//					  $('#cards .' + category.split(' ')[0]).fadeIn('slow');
//				  }
//			  }
//			}
					// toggle the image and the boolean array value
			if (categoryVisible[category] == true) {
				$(this).addClass('toggledOff');
				categoryVisible[category] = false;
			}
			else if (categoryVisible[category] == false) {
				$(this).removeClass('toggledOff');
				categoryVisible[category] = true;
			}
		}
	});
});
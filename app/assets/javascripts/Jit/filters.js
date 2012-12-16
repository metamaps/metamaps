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


 $(document).ready(function() {
   
   $('.sideOption').bind('click',function(){
	  $('.sideOption').animate({
		width: '250px',
		height: '76px'
	  }, 700, function() {
		$('#by_name_input').focus();
	  });
	  $('#closeFind').css('display','block');
	  $('.sideOption').unbind('click');
	  $('.sideOption').css('cursor','default');
   });
   
   $('#closeFind').click(function(){
	   $('#closeFind').css('display','none');
	   $('.sideOption').css('cursor','pointer');
	   $('.sideOption').animate({
		width: '45px',
		height: '32px'
	  }, 700, function() {
		    $('.sideOption').bind('click',function(){
				  firstVal = $('.sideOption option[value="name"]').attr('selected');
				  secondVal = $('.sideOption option[value="metacode"]').attr('selected');
				  if ( firstVal === 'selected') {
					  $('.sideOption').animate({
						width: '250px',
						height: '76px'
					  }, 700, function() {
						$('#by_name_input').focus();
					  });
				  } else if ( secondVal === 'selected') {
					  $('.sideOption').animate({
						width: '380px',
						height: '463px'
					  }, 700, function() {
						// Animation complete.
					  });
				  }
				  $('#closeFind').css('display','block');
				  $('.sideOption').unbind('click');
				  $('.sideOption').css('cursor','default');
			   });
	  });
   });
   
   $('.sideOption .select_content').change(function() {
	      firstVal = $(this).children("option[value='topics']").attr('selected');
		  secondVal = $(this).children("option[value='maps']").attr('selected');
		  thirdVal = $(this).children("option[value='mappers']").attr('selected');
		  if ( firstVal == 'selected') {
			  $('.sideOption .select_type').children("option[value='metacode']").removeAttr('disabled');
			  $('.find').css('display','none');
			  $('.find_topic_by_name').css('display','block');
			  $('#topic_by_name_input').focus();
			  
		  }
		  else if ( secondVal == 'selected' ) {
			  if ( $(".sideOption .select_type").val() != "name") { 
			  	$(".sideOption .select_type").val('name');
			    $('.sideOption').animate({
					width: '250px',
					height: '76px'
				  }, 700, function() {
					// Animation complete.
				  });
			  }
			  $('.sideOption .select_type').children("option[value='metacode']").attr('disabled','disabled');
			  $('.find').css('display','none');
			  $('.find_map_by_name').css('display','block');
			  $('#map_by_name_input').focus();
		  }
		  else if ( thirdVal == 'selected' ) {
			  $(".sideOption .select_type").val('name');
			  $('.sideOption .select_type').children("option[value='metacode']").attr('disabled','disabled');
			  $('.find').css('display','none');
			  $('.find_mapper_by_name').css('display','block');
			  $('#mapper_by_name_input').focus();
		  }
	});
   
   $('.sideOption .select_type').change(function() {
	      firstVal = $(this).children("option[value='name']").attr('selected');
		  secondVal = $(this).children("option[value='metacode']").attr('selected');
		  if ( firstVal === 'selected') {
			  $('.find_topic_by_metacode').fadeOut('fast', function() {
				  showAll();
				  $('.find_topic_by_metacode ul li').not('#hideAll, #showAll').removeClass('toggledOff');
				  for (var catVis in categoryVisible) {
					  categoryVisible[catVis] = true;
				  }
				  $('.sideOption').animate({
					width: '250px',
					height: '76px'
				  }, 700, function() {
					// Animation complete.
				  });
				  $('.find_topic_by_name').fadeIn('fast');  
			  });
		  }
		  else if ( secondVal === 'selected' ) {
			  $('.find_topic_by_name').fadeOut('fast', function() {
				  $('.sideOption').animate({
					width: '380px',
					height: '463px'
				  }, 700, function() {
					// Animation complete.
				  });
				  $('.find_topic_by_metacode').fadeIn('fast');  
			  });
		  }
	});
   
   $('.find_topic_by_name #topic_by_name_input').bind('railsAutocomplete.select', function(event, data){
      /* Do something here */
      if (data.item.user_id != undefined && data.item.id != undefined) {
        window.open("/users/" + data.item.user_id + "/items/" + data.item.id)
      }
      $('.find_topic_by_name #topic_by_name_input').val('');
    });
    
    $('.find_topic_by_name').bind('submit', function(event, data){
      event.preventDefault();
    });
	
	$('.find_map_by_name #map_by_name_input').bind('railsAutocomplete.select', function(event, data){
      /* Do something here */
      if (data.item.user_id != undefined && data.item.id != undefined) {
        window.open("/users/" + data.item.user_id + "/maps/" + data.item.id)
      }
      $('.find_map_by_name #map_by_name_input').val('');
    });
    
    $('.find_map_by_name').bind('submit', function(event, data){
      event.preventDefault();
    });
	
	$('.find_mapper_by_name #mapper_by_name_input').bind('railsAutocomplete.select', function(event, data){
      /* Do something here */
      if (data.item.id != undefined) {
        window.open("/users/" + data.item.id)
      }
      $('.find_mapper_by_name #mapper_by_name_input').val('');
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
			else {	
			  if (categoryVisible[category] == true) {
				  if (category.split(' ').length == 1) {
					$('#cards .' + category).fadeOut('slow');
				  }
				  else {
					  $('#cards .' + category.split(' ')[0]).fadeOut('slow');
				  }
			  }
			  else if (categoryVisible[category] == false) {
				  if (category.split(' ').length == 1) {
					$('#cards .' + category).fadeIn('slow');
				  }
				  else {
					  $('#cards .' + category.split(' ')[0]).fadeIn('slow');
				  }
			  }
			}
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
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery-ui
//= require autocomplete-rails-uncompressed
//= require jquery_ujs
//= require_tree .

// other options are 'graph'
var viewMode = "list";

 $(document).ready(function() {
   
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
				  $('.find_topic_by_name').fadeIn('fast');  
			  });
		  }
		  else if ( secondVal === 'selected' ) {
			  $('.find_topic_by_name').fadeOut('fast', function() {
				  $('.find_topic_by_metacode').fadeIn('fast');  
			  });
		  }
	});
   
   $('.find_topic_by_name #item_name').bind('railsAutocomplete.select', function(event, data){
      /* Do something here */
      if (data.item.user_id != undefined && data.item.id != undefined) {
        window.open("/users/" + data.item.user_id + "/items/" + data.item.id)
      }
      else if (data.item.value == "no existing match"){
        $('.find_topic_by_name #item_name').val('');
      }
    });
    
    $('.find_topic_by_name').bind('submit', function(event, data){
      event.preventDefault();
    });

	$(".focus .desc").mCustomScrollbar(); 
	$(".scroll").mCustomScrollbar();
	
	$('.nodemargin').css('padding-top',$('.focus').css('height'));
	
	
	// if there's an add topic directly to page form loaded on the page you're on then let the user add one
	$('#newtopic').click(function(event){
		obj1 = document.getElementById('new_item');
		if (obj1 != null) {
			  $('#new_synapse').css('display','none');
			  $('#new_item').fadeIn('fast');
			  event.preventDefault();
		}
	});
	
	// if there's an add synapse directly to page form loaded on the page you're on then let the user add one
	$('#newsynapse').click(function(event){
		obj2 = document.getElementById('new_synapse');
		if (obj2 != null) {
			  $('#new_item').css('display','none');
			  $('#new_synapse').fadeIn('fast');
			  event.preventDefault();
		}
	});
	
	
	// controls the sliding hover of the filters
    var sliding1 = false; 
    $(".accountWrap").hover( 
        function () { 
          if (! sliding1) { 
            sliding1 = true; 
            $(".account").slideDown('slow', function() { 
              sliding1 = false; 
            }); 
          } 
        },  
        function () { 
          if (! sliding1) { 
            sliding1 = true; 
            $(".account").slideUp('slow', function() { 
              sliding1 = false; 
            }); 
          } 
        } 
    );
	
	var sliding2 = false; 
    $(".createWrap").hover( 
        function () { 
          if (! sliding2) { 
            sliding2 = true; 
            $(".create").slideDown('slow', function() { 
              sliding2 = false; 
            }); 
          } 
        },  
        function () { 
          if (! sliding2) { 
            sliding2 = true; 
            $(".create").slideUp('slow', function() { 
              sliding2 = false; 
            }); 
          } 
        } 
    );
	
	var sliding3 = false; 
    $(".exploreWrap").hover( 
        function () { 
          if (! sliding3) { 
            sliding3 = true; 
            $(".explore").slideDown('slow', function() { 
              sliding3 = false; 
            }); 
          } 
        },  
        function () { 
          if (! sliding3) { 
            sliding3 = true; 
            $(".explore").slideUp('slow', function() { 
              sliding3 = false; 
            }); 
          } 
        } 
    );
	
	var sliding4 = false; 
	var lT;
    $(".legend").hover( 
        function () { 
		  clearTimeout(lT);
          if (! sliding4) { 
			  sliding4 = true; 
			  $("#iconLegend ul").slideDown('slow', function() { 
				sliding4 = false; 
			  });
          } 
        },  
        function () { 
          lT = setTimeout(function() { 
			  if (! sliding4) { 
					sliding4 = true; 
					$("#iconLegend ul").slideUp('slow', function() { 
					  sliding4 = false; 
					});		
			  }
		  },800); 
        } 
    ); 

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
	
	// this is to save the layout of maps
	var coor = "";
	$("#saveLayout").click(function(event) {
	  event.preventDefault();
	  coor = "";
	  if (gType == "arranged" || gType == "chaotic") {
		  Mconsole.graph.eachNode(function(n) {
			coor = coor + n.data.$mappingid + '/' + n.pos.x + '/' + n.pos.y + ',';
		  });
		  coor = coor.slice(0, -1);
		  $('#map_coordinates').val(coor);
		  $('#saveMapLayout').submit();
		  
	  }
	});
});
 
 

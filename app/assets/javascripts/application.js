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
//= require jquery_ujs
//= require_tree .
//= require Jit/jit-yc
//= require Jit/excanvas
//= require Jit/ForceDirected/metamapFD
//= require Jit/RGraph/metamapRG
//= require Jit/filters

 $(document).ready(function() {
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
	
    var sliding = false; 
    $(".legend").hover( 
        function () { 
          if (! sliding) { 
            sliding = true; 
            $("#iconLegend ul").slideDown('slow', function() { 
              sliding = false; 
            }); 
          } 
        },  
        function () { 
          if (! sliding) { 
            sliding = true; 
            $("#iconLegend ul").slideUp('slow', function() { 
              sliding = false; 
            }); 
          } 
        } 
    ); 

	// toggle visibility of item categories based on status in the filters list
	$('.legend ul li').click(function(event) {
		obj = document.getElementById('container');
        
		var category = $(this).children('img').attr('alt');
		
		// this means that we are on a map view		
		if (obj != null) {		  
			  if (fd != null) {
			  		switchVisible(fd, category);
			  }
			  else if (rg != null) {
			  		switchVisible(rg, category);
			  } 
	  	}
		// this means that we are on a card view
	  	else {	
		  console.log('test');	  		 
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
	});
});
 
 

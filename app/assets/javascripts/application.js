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

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

 $(document).ready(function() {
	$('.nodemargin').css('padding-top',$('.focus').css('height'));
	
	$('#newtopic').click(function(event){
		obj = document.getElementById('new_item');
		if (obj != null) {
			  $('#new_item').fadeIn('fast');
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

	$('.legend ul li').click(function(event) {
		obj = document.getElementById('container');
        
		var category = $(this).children('img').attr('alt');
		category = capitaliseFirstLetter(category);
		
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
			  $('#cards .' + category).fadeOut('fast');
		  }
		  else if (categoryVisible[category] == false) {
			  $('#cards .' + category).fadeIn('fast');
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
 
 

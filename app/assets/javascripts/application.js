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
 
    $('#new_item').bind('contextmenu', function(e){
		return false;
	});
	
	/// this is for the topic creation autocomplete fielf
	$('#item_name').bind('railsAutocomplete.select', function(event, data){  
      if (data.item.id != undefined) {
        $('#item_grabItem').val(data.item.id);
		$('#new_item').submit();
      }
    });
	
	$(".focus .desc").mCustomScrollbar(); 
	$(".scroll").mCustomScrollbar();
	
	$('.nodemargin').css('padding-top',$('.focus').css('height'));	
	
	// controls the sliding hover of the menus at the top
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
 
 

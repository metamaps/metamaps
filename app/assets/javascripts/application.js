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
//= require jquery.purr
//= require best_in_place
//= require autocomplete-rails-uncompressed
//= require jquery_ujs
//= require_tree .

// other options are 'graph'
var viewMode = "list";

var labelType, useGradients, nativeTextSupport, animate, json, Mconsole = null, gType, tempNode = null, tempInit = false, tempNode2 = null, metacodeIMGinit = false;

 $(document).ready(function() {
 
    $('#new_item, #new_synapse').bind('contextmenu', function(e){
		return false;
	});
	
	/// this is for the topic creation autocomplete field
	$('#item_name').bind('railsAutocomplete.select', function(event, data){  
      if (data.item.id != undefined) {
        $('#item_grabItem').val(data.item.id);
      }
    });
	
	$('.new_topic').bind('submit', function(event, data){
      event.preventDefault();
    });
	
	$(".focus .desc").mCustomScrollbar(); 
	$(".scroll").mCustomScrollbar();
	
	$('.nodemargin').css('padding-top',$('.focus').css('height'));	
	
	// controls the sliding hover of the menus at the top
	var sliding1 = false; 
	var lT;
    $(".logo").hover( 
        function () { 
		  clearTimeout(lT);
          if (! sliding1) { 
            sliding1 = true; 
			if (userid != null) {
              $('.footer .menu').animate({
				height: '252px'
			  }, 300, function() {
				sliding1 = false;
			  });
			}
			else {
			  $('.footer .menu').animate({
				height: '140px'
			  }, 300, function() {
				sliding1 = false;
			  });
			}
          } 
        },  
        function () { 
          lT = setTimeout(function() { 
			  if (! sliding1) { 
				sliding1 = true; 
				$('.footer .menu').animate({
					height: '0px'
				  }, 300, function() {
					sliding1 = false;
				  });
			  } 
		  },800); 
        } 
    );
	
	// this is to save the layout of maps when you're on a map page
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

// this is to save your console to a map
function saveToMap() {
  var Coor = "";
  Mconsole.graph.eachNode(function(n) {
    Coor = Coor + n.id + '/' + n.pos.x + '/' + n.pos.y + ',';
  });
  Coor = Coor.slice(0, -1);
  $('#map_topicsToMap').val(Coor);
  $('#new_map').fadeIn('fast');
}

function addMetacode() {
	// code from http://www.professorcloud.com/mainsite/carousel-integration.htm
	if (!metacodeIMGinit) {		
		$("#metacodeImg").CloudCarousel( { 
			//reflHeight: 10,
			//reflGap: 2,
			titleBox: $('#metacodeImgTitle'),
			//buttonLeft: $('#left-but'),
			//buttonRight: $('#right-but'),
			yRadius:40,
			xPos: 150,
			yPos: 40,
			speed:0.15,
			mouseWheel:true,
			bringToFront: true
		});
		metacodeIMGinit = true;
	}
}


 
 

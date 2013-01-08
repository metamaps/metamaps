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

var labelType, useGradients, nativeTextSupport, animate, json, Mconsole = null, gType, tempNode = null, tempInit = false, tempNode2 = null, metacodeIMGinit = false, findOpen = false, analyzeOpen = false, organizeOpen = false, goRealtime = false, mapid = null;

 $(document).ready(function() {
 
    $('#new_topic, #new_synapse').bind('contextmenu', function(e){
		return false;
	});
	
	/// this is for the topic creation autocomplete field
	$('#topic_name').bind('railsAutocomplete.select', function(event, data){  
      if (data.item.id != undefined) {
        $('#topic_grabTopic').val(data.item.id);
		$('.new_topic').submit();
      }
    });
	
	$('.new_topic').bind('submit', function(event, data){
      event.preventDefault();
    });
	
	//$("#cards").mCustomScrollbar(); 
	$(".scroll").mCustomScrollbar();
	
	//$('.nodemargin').css('padding-top',$('.focus').css('height'));	
	
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
	$("#saveLayout").click(function(event) {
	  event.preventDefault();
	  saveLayoutAll();
	});
	
});

// this is to save the layout of a map
function saveLayoutAll() {
  var coor = "";
  if (gType == "arranged" || gType == "chaotic") {
    Mconsole.graph.eachNode(function(n) {
    coor = coor + n.data.$mappingid + '/' + n.pos.x + '/' + n.pos.y + ',';
    });
    coor = coor.slice(0, -1);
    $('#map_coordinates').val(coor);
    $('#saveMapLayout').submit();
  }
}

// this is to update the location coordinate of a single node on a map
function saveLayout(id) {
  var n = Mconsole.graph.getNode(id);
  $('#map_coordinates').val(n.data.$mappingid + '/' + n.pos.x + '/' + n.pos.y);
  $('#saveMapLayout').submit();
  dragged = 0;
}

// this is to save your console to a map
function saveToMap() {
  var nodes_data = "", synapses_data = "";
  var synapses_array = new Array();
  Mconsole.graph.eachNode(function(n) {
    nodes_data += n.id + '/' + n.pos.x + '/' + n.pos.y + ',';
    n.eachAdjacency(function(adj) {
      synapses_array.push(adj.getData("id"));
    });
  });

  //get unique values only
  synapses_array = $.grep(synapses_array, function(value, key){
    return $.inArray(value, synapses_array) === key;
  });

  synapses_data = synapses_array.join();
  console.log(synapses_data);
  nodes_data = nodes_data.slice(0, -1);

  $('#map_topicsToMap').val(nodes_data);
  $('#map_synapsesToMap').val(synapses_data);
  $('#new_map').fadeIn('fast');
}

// this is for hiding one topic from your canvas
function removeFromCanvas(topic_id) {
  var node = Mconsole.graph.getNode(topic_id);
  node.setData('alpha', 0, 'end');  
  node.eachAdjacency(function(adj) {  
	adj.setData('alpha', 0, 'end');  
  });  
  Mconsole.fx.animate({  
	modes: ['node-property:alpha',  
			'edge-property:alpha'],  
	duration: 1000  
  });
  Mconsole.graph.removeNode(topic_id);
  Mconsole.labels.disposeLabel(topic_id);
}

function addMetacode() {
	// code from http://www.professorcloud.com/mainsite/carousel-integration.htm
  //mouseWheel:true,
	if (!metacodeIMGinit) {		
		$("#metacodeImg").CloudCarousel( {
			titleBox: $('#metacodeImgTitle'),
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

function MconsoleReset() {
	
	var tX = Mconsole.canvas.translateOffsetX;
	var tY = Mconsole.canvas.translateOffsetY;
	Mconsole.canvas.translate(-tX,-tY);
	
	var mX = Mconsole.canvas.scaleOffsetX;
	var mY = Mconsole.canvas.scaleOffsetY;
	Mconsole.canvas.scale((1/mX),(1/mY));
	
}

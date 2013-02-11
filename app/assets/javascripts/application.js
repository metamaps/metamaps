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

var labelType, useGradients, nativeTextSupport, animate, json, Mconsole = null, gType, tempNode = null, tempInit = false, tempNode2 = null, metacodeIMGinit = false, findOpen = false, analyzeOpen = false, organizeOpen = false, goRealtime = false, mapid = null, mapperm = false;

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
            var listLength = $('.logo .menu li').length * 27;          
              $('.footer .menu').animate({
              height: listLength + 'px'
              }, 300, function() {
              sliding1 = false;
              });
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
  
  addHoverForSettings();
  
  //bind best_in_place ajax callbacks
  $('.best_in_place_metacode').bind("ajax:success", function() {
    var metacode = $(this).html();
    //changing img alt, img src for top card (topic view page)
    //and on-canvas card. Also changing image of node
    $(this).parents('.CardOnGraph').find('img.icon').attr('alt', metacode);
    $(this).parents('.CardOnGraph').find('img.icon').attr('src', imgArray[metacode].src);
  });
  $('.best_in_place_desc').bind("ajax:success", function() {
    $(this).parents('.CardOnGraph').find('.scroll').mCustomScrollbar("update");
  });
  $('.best_in_place_link').bind("ajax:success", function() {
    var link = $(this).html();
    $(this).parents('.CardOnGraph').find('.go-link').attr('href', link);
  });
    
	// this is to save the layout of maps when you're on a map page
	$("#saveLayout").click(function(event) {
	  event.preventDefault();
	  saveLayoutAll();
	});
	
});

function addHoverForSettings() {
  // controls the sliding hover of the settings for cards
  $(".permActivator").unbind('mouseover');
  $(".permActivator").unbind('mouseout');
	var sliding2 = false; 
	var lT1,lT2;
    $(".permActivator").bind('mouseover', 
        function () { 
          clearTimeout(lT2);
          that = this;       
          lT1 = setTimeout(function() {
            if (! sliding2) { 
              sliding2 = true;            
                $(that).animate({
                  width: '203px',
                  height: '37px'
                }, 300, function() {
                  sliding2 = false;
                });
            } 
          }, 300);
        });
    
    $(".permActivator").bind('mouseout',    
        function () {
          clearTimeout(lT1);
          that = this;        
          lT2 = setTimeout(function() { 
			      if (! sliding2) { 
				      sliding2 = true; 
				      $(that).animate({
					      height: '16px',
                width: '16px'
				      }, 300, function() {
					      sliding2 = false;
				      });
			      } 
		      },800); 
        } 
    );
    
  $('.best_in_place_permission').unbind("ajax:success");
    //bind best_in_place ajax callbacks
  $('.best_in_place_permission').bind("ajax:success", function() {
    var permission = $(this).html();
    var el = $(this).parents('.cardSettings').find('.mapPerm');
    el.attr('title', permission);
    if (permission == "commons") el.html("co");
    else if (permission == "public") el.html("pu");
    else if (permission == "private") el.html("pr");
  });
}

// this is to save the layout of a map
function saveLayoutAll() {
  var coor = "";
  if (gType == "arranged" || gType == "chaotic") {
    Mconsole.graph.eachNode(function(n) {
      coor = coor + n.getData("mappingid") + '/' + n.pos.x + '/' + n.pos.y + ',';
    });
    coor = coor.slice(0, -1);
    $('#map_coordinates').val(coor);
    $('#saveMapLayout').submit();
  }
}

// this is to update the location coordinate of a single node on a map
function saveLayout(id) {
  var n = Mconsole.graph.getNode(id);
  $('#map_coordinates').val(n.getData("mappingid") + '/' + n.pos.x + '/' + n.pos.y);
  $('#saveMapLayout').submit();
  dragged = 0;
  $('#saveLayout').attr('value','Saved!');
  setTimeout(function(){$('#saveLayout').attr('value','Save Layout')},1500);
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
  nodes_data = nodes_data.slice(0, -1);

  $('#map_topicsToMap').val(nodes_data);
  $('#map_synapsesToMap').val(synapses_data);
  $('#new_map').fadeIn('fast');
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

function fetchRelatives(node) {
  var myA = $.ajax({
    type: "Get",
    url: "/topics/" + node.id + "?format=json",
    success: function(data) {
      if (gType == "centered") {
        Mconsole.busy = true;
        Mconsole.op.sum(data, {  
          type: 'fade',
          duration: 500,
          hideLabels: false
        });
        Mconsole.graph.eachNode(function (n) {
          n.eachAdjacency(function (a) {
            if (!a.getData('showDesc')) {
              a.setData('alpha', 0.4, 'start');
              a.setData('alpha', 0.4, 'current');
              a.setData('alpha', 0.4, 'end');
            }
          });
        });
        Mconsole.busy = false;
      }
      else {
        Mconsole.op.sum(data, {  
          type: 'nothing',
        });
        Mconsole.plot();
      }
      /*Mconsole.op.contract(node, {  
        type: 'replot' 
      });
      Mconsole.op.expand(node, {  
        type: 'animate',
        transition: $jit.Trans.Elastic.easeOut,
        duration: 1000                     
      });*/
    },
    error: function(){
      alert('failure');
    }
  });
}

function MconsoleReset() {
	
	var tX = Mconsole.canvas.translateOffsetX;
	var tY = Mconsole.canvas.translateOffsetY;
	Mconsole.canvas.translate(-tX,-tY);
	
	var mX = Mconsole.canvas.scaleOffsetX;
	var mY = Mconsole.canvas.scaleOffsetY;
	Mconsole.canvas.scale((1/mX),(1/mY));
	
}

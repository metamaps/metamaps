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
// require autocomplete-rails-uncompressed
//
//= require jquery
//= require jquery.purr
//= require best_in_place
//= require jquery_ujs
//= require_tree .

// other options are 'graph'
var viewMode = "list";

var labelType, useGradients, nativeTextSupport, animate, json, Mconsole = null, gType, tempNode = null, tempInit = false, tempNode2 = null, metacodeIMGinit = false, findOpen = false, analyzeOpen = false, organizeOpen = false, goRealtime = false, mapid = null, mapperm = false, touchPos, touchDragNode, mouseIsDown = false;

 $(document).ready(function() {
 
  var menuIsOpen = false, searchIsOpen = false, accountIsOpen = false;
 
  $('#new_topic, #new_synapse').bind('contextmenu', function(e){
		return false;
	});
	
	/// this is for the topic creation autocomplete field
  $('#topic_name').typeahead([
         {
            name: 'topic_autocomplete',
            template: '<p>{{value}}</p><div class="type">{{type}}</div><img width="20" height="20" src="{{typeImageURL}}" alt="{{type}}" title="{{type}}"/>',
            remote: {
                url: '/topics/autocomplete_topic?term=%QUERY'
            },
            engine: Hogan
          }
  ]);
  $('#topic_name').bind('typeahead:selected', function (event, datum, dataset) {
        $('#topic_grabTopic').val(datum.id);
		    $('.new_topic').submit();
        event.preventDefault();
        event.stopPropagation();
  });
	
	$('.new_topic, .new_synapse').bind('submit', function(event, data){
      event.preventDefault();
  });
    
  // this is for the search box
  $('.sidebarSearchField').typeahead([
         {
            name: 'topics',
            template: $('.topicTemplate').html(),
            remote: {
                url: '/search/topics?term=%QUERY'
            },
            engine: Hogan,
            header: '<h3 class="search-header">Topics</h3>'
          },
          {
            name: 'maps',
            template: $('.mapTemplate').html(),
            remote: {
                url: '/search/maps?term=%QUERY'
            },
            engine: Hogan,
            header: '<h3 class="search-header">Maps</h3>'
          },
          {
            name: 'mappers',
            template: $('.mapperTemplate').html(),
            remote: {
                url: '/search/mappers?term=%QUERY'
            },
            engine: Hogan,
            header: '<h3 class="search-header">Mappers</h3>'
          }
  ]);
  
  
	
	$(".scroll").mCustomScrollbar();
  
  $('.headertop').draggable();
  var positionLeft = $(window).width() - $('.headertop').width() - 50;
  $('.headertop').css('left', positionLeft + 'px');
  $('.notice.metamaps').delay(10000).fadeOut('fast');
  $('.alert.metamaps').delay(10000).fadeOut('fast');
	
	//$('.nodemargin').css('padding-top',$('.focus').css('height'));	
	
	// controls the sliding hover of the menus at the top
  var sliding1 = false; 
	var lT;
  
  var closeMenu = function() {
    lT = setTimeout(function() { 
			  if (! sliding1) { 
				  sliding1 = true; 
				  // $('.footer .menu').animate({
					  // height: '0px'
				  // }, 300, function() {
					  // sliding1 = false;
            // menuIsOpen = false;
				  // });
          $('.footer').css('border-top-right-radius','5px');
          $('.logo').animate({
            'background-position-x':'-10px'
          }, 300);
          $('.footer .menu').fadeOut(300, function() {
					  sliding1 = false;
            menuIsOpen = false;
				  });
			  } 
		  },800); 
  }
  
  var openMenu = function() {
    //closeAccount();
    //closeSearch();
    $('.menuflag').hide();
    clearTimeout(lT);
    if (! sliding1) { 
      sliding1 = true;
                
        // $('.footer .menu').animate({
        // height: listLength + 'px'
        // }, 300, function() {
        // sliding1 = false;
        // });
        $('.footer').css('border-top-right-radius','0');
        $('.logo').animate({
            'background-position-x':'-7px'
        }, 300);
        $('.footer .menu').fadeIn(300, function() {
         sliding1 = false;
        });
    }
  }
    // bind the hover events
	  $(".logo").hover(openMenu, closeMenu);
    
    // when on touch screen, make touching on the logo do what hovering does on desktop
    $("#mainTitle a").bind('touchend', function(evt) {
      if (!menuIsOpen) {
          openMenu();
          evt.preventDefault(); 
          evt.stopPropagation(); 
      }
    });   

    
  // start account section
  $('.sidebarAccountIcon').click(function(e) {
    if (!accountIsOpen) openAccount();
    else if (accountIsOpen) closeAccount();
    e.stopPropagation();
  });
  $('.sidebarAccountBox').click(function(e) {
    e.stopPropagation();
  });
  
  function openAccount() {
    //closeMenu();
    //closeSearch();
    if (!accountIsOpen) {
    $('.sidebarAccountBox').fadeIn(300, function() {
         //$('.sidebarSearchField').css({padding:'5px 10px', width:'180px'}).focus();
         accountIsOpen = true;
    });
    }
  }
  function closeAccount() {
    if (accountIsOpen) {
    $('.sidebarAccountBox').fadeOut(300, function() {
      accountIsOpen = false; 
    });
    }
  }
  // end account section
  
  // start search section
  $('.sidebarSearchIcon').click(function(e) {
    if (!searchIsOpen) openSearch();
    else if (searchIsOpen) closeSearch();
    e.stopPropagation();
  });
  $('.sidebarSearch .twitter-typeahead').click(function(e) {
    e.stopPropagation();
  });
  
  function openSearch() {
    hideCards();
    $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
        width: '200px'
       }, 300, function() {
         $('.sidebarSearchField, .sidebarSearch .tt-hint').css({padding:'5px 10px', width:'180px'});
         $('.sidebarSearchField').focus();
         searchIsOpen = true;
    });
  }
  function closeSearch() {
    if (searchIsOpen) {
    $('.sidebarSearchField, .sidebarSearch .tt-hint').css({padding:'5px 0', width:'200px'});
    $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
        width: '0'
      }, 300, function() {
      searchIsOpen = false; 
    });
    }
  }
  // end search section
  
  $('body').click(function() {
    closeSearch();
    closeAccount();
  });
  
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
  
  // bind keyboard handlers
  $('body').bind('keyup', function(e) {
    switch(e.which) {
      case 13: enterKeyHandler(); break;
      case 27: escKeyHandler(); break;
      default: break; //console.log(e.which);
    }
  });
	
});  // end document.ready

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
    //don't add to the map if it was filtered out
    if (categoryVisible[n.getData('metacode')] == false) {
      return;
    }

    var x, y;
    if (n.pos.x && n.pos.y) {
      x = n.pos.x;
      y = n.pos.y;
    } else {
      var x = Math.cos(n.pos.theta) * n.pos.rho;
      var y = Math.sin(n.pos.theta) * n.pos.rho;
    }
    nodes_data += n.id + '/' + x + '/' + y + ',';
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
			speed:0.3,
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

function openNodeShowcard(node) {
  //populate the card that's about to show with the right topics data
  populateShowCard(node);

  // positions the card in the right place
  $('#showcard').css('top', '250px');
  $('#showcard').css('left', '100px');   

  $('.showcard.topic_' + node.id).fadeIn('fast');
  //node.setData('dim', 1, 'current');
  MetamapsModel.showcardInUse = node.id;
}

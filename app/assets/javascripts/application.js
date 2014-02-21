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
//= require jquery-ui
//= require jquery.purr
//= require best_in_place
//= require jquery_ujs
//= require_tree .

// other options are 'graph'
var viewMode = "list";

var labelType, useGradients, nativeTextSupport, animate, json, Mconsole = null, gType, tempNode = null, tempInit = false, tempNode2 = null, metacodeIMGinit = false, findOpen = false, analyzeOpen = false, organizeOpen = false, goRealtime = false, mapid = null, mapperm = false, touchPos, touchDragNode, mouseIsDown = false;

 $(document).ready(function() {
  
  function bindMainMenuHover() {
      
      var menuIsOpen = false
      
      // controls the sliding hover of the bottom left menu
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
              }, 200);
              $('.footer .menu').fadeOut(200, function() {
                sliding1 = false;
                menuIsOpen = false;
              });
            } 
          },500); 
      }
      
      var openMenu = function() {
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
            }, 200);
            $('.footer .menu').fadeIn(200, function() {
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
   }
   
   function bindSearchHover() {
      
      var searchIsOpen = false
      
      // controls the sliding hover of the search
      var sliding1 = false; 
      var lT;
      
      var openSearch = function() {
        clearTimeout(lT);
        if (!sliding1 && !searchIsOpen) {
          hideCards();
          sliding1 = true;
          $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
              width: '200px'
             }, 200, function() {
               $('.sidebarSearchField, .sidebarSearch .tt-hint').css({padding:'5px 10px', width:'180px'});
               $('.sidebarSearchField').focus();
               sliding1 = false
               searchIsOpen = true;
          });
        }
      }
      var closeSearch = function(closeAfter) {
        lT = setTimeout(function() { 
            if (!sliding1 && searchIsOpen && $('.sidebarSearchField').val() == '') { 
              sliding1 = true;
              $('.sidebarSearchField, .sidebarSearch .tt-hint').css({padding:'5px 0', width:'200px'});
              $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
                  width: '0'
                }, 200, function() {
                $('.sidebarSearchField').typeahead('setQuery','');
                sliding1 = false;
                searchIsOpen = false; 
              });
            } 
          },closeAfter);
      }

      // bind the hover events
      $(".sidebarSearch").hover(function(){ openSearch() }, function() { closeSearch(800) });
      
      $('.sidebarSearchIcon').click(function(e) {
        $('.sidebarSearchField').focus();
      });
      $('.sidebarSearch').click(function(e) {
        e.stopPropagation();
      });
      $('body').click(function(e) {
        closeSearch(0);
      });
      
      // if the search is closed and user hits SHIFT+S
      $('body').bind('keyup', function(e) {
        switch(e.which) {
          case 83:
            if (e.shiftKey && !searchIsOpen) {
              openSearch();
            }
            break;
          default: break; //console.log(e.which);
        }
      });
        
      // initialize the search box autocomplete results
      var mapheader = userid ? '<h3 class="search-header">Maps</h3><input type="checkbox" class="limitToMe" id="limitMapsToMe"></input><label for="limitMapsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div>' : '<h3 class="search-header">Maps</h3><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div>';
      var topicheader = userid ? '<h3 class="search-header">Topics</h3><input type="checkbox" class="limitToMe" id="limitTopicsToMe"></input><label for="limitTopicsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div>' : '<h3 class="search-header">Topics</h3><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div>';
      $('.sidebarSearchField').typeahead([
             {
                name: 'topics',
                dupChecker: function (datum1,datum2) {
                  return false;
                },
                template: $('.topicTemplate').html(),
                remote: {
                    url: '/search/topics?term=%QUERY',
                    replace: function () {
                        var q = '/search/topics?term=' + $('.sidebarSearchField').val();
                        if ($("#limitTopicsToMe").is(':checked')) {
                            q += "&user=" + userid.toString();
                        }
                        return q;
                    },
                    filter: function(dataset) {
                      if (dataset.length == 0) {
                        dataset.push({
                          value: "No results",
                          label: "No results",
                          typeImageURL: "/assets/wildcard.png",
                          rtype: "noresult"                          
                        });
                      }
                      return dataset;
                    }
                },
                engine: Hogan,
                header: topicheader
              },
              {
                name: 'maps',
                dupChecker: function (datum1,datum2) {
                  return false;
                },
                template: $('.mapTemplate').html(),
                remote: {
                    url: '/search/maps?term=%QUERY',
                    replace: function () {
                        var q = '/search/maps?term=' + $('.sidebarSearchField').val();
                        if ($("#limitMapsToMe").is(':checked')) {
                            q += "&user=" + userid.toString();
                        }
                        return q;
                    },
                    filter: function(dataset) {
                      if (dataset.length == 0) {
                        dataset.push({
                          value: "No results",
                          label: "No results",
                          rtype: "noresult" 
                        });
                      }
                      return dataset;
                    }
                },
                engine: Hogan,
                header: mapheader
              },
              {
                name: 'mappers',
                dupChecker: function (datum1,datum2) {
                  return false;
                },
                template: $('.mapperTemplate').html(),
                remote: {
                    url: '/search/mappers?term=%QUERY',
                    filter: function(dataset) {
                      if (dataset.length == 0) {
                        dataset.push({
                          value: "No results",
                          label: "No results",
                          rtype: "noresult"
                        });
                      }
                      return dataset;
                    }
                },
                engine: Hogan,
                header: '<h3 class="search-header">Mappers</h3><div class="minimizeResults minimizeMapperResults"></div><div class="clearfloat"></div>'
              }
      ]);
      // tell the autocomplete to launch a new tab with the topic, map, or mapper you clicked on
      $('.sidebarSearchField').bind('typeahead:selected', function (event, datum, dataset) {
          console.log(event);
          if (datum.rtype != "noresult") {
            var win;
            if (dataset == "topics") {
              win=window.open('/topics/' + datum.id, '_blank');
            }
            else if (dataset == "maps") {
              win=window.open('/maps/' + datum.id, '_blank');
            }
            else if (dataset == "mappers") {
              win=window.open('/maps/mappers/' + datum.id, '_blank');
            }
            win.focus();
            closeSearch(0);
          }
      });
      
      
      var checkboxChangeInit = false, minimizeInit = false;
      
      $('.sidebarSearchField').bind('keyup', function () {
          
          // when the user selects 'added by me' resend the query with their userid attached
          if (!checkboxChangeInit) {
            $('.limitToMe').bind("change", function(e) {
              // set the value of the search equal to itself to retrigger the autocomplete event
              searchIsOpen = false;
              $('.sidebarSearchField').typeahead('setQuery',$('.sidebarSearchField').val());
              setTimeout(function() { searchIsOpen = true; }, 2000);
            });
            checkboxChangeInit = true;
          }
          
          // when the user clicks minimize section, hide the results for that section
          if (!minimizeInit) {
            $('.minimizeMapperResults').click(function(e) {
              var s = $('.tt-dataset-mappers .tt-suggestions');
              console.log(s.css('height'));
              if (s.css('height') == '0px') {
                $('.tt-dataset-mappers .tt-suggestions').css({'height':'auto','overflow':'visible'});
                $(this).removeClass('maximizeResults').addClass('minimizeResults');
              } else {
                $('.tt-dataset-mappers .tt-suggestions').css({'height':'0','overflow':'hidden'});
                $(this).removeClass('minimizeResults').addClass('maximizeResults');
              }
            });
            $('.minimizeTopicResults').click(function(e) {
              var s = $('.tt-dataset-topics .tt-suggestions');
              console.log(s.css('height'));
              if (s.css('height') == '0px') {
                s.css({'height':'auto','border-top':'none','overflow':'visible'});
                $(this).removeClass('maximizeResults').addClass('minimizeResults');
              } else {
                s.css({'height':'0','border-top':'1px solid #222','overflow':'hidden'});
                $(this).removeClass('minimizeResults').addClass('maximizeResults');
              }
            });
            $('.minimizeMapResults').click(function(e) {
              var s = $('.tt-dataset-maps .tt-suggestions');
              console.log(s.css('height'));
              if (s.css('height') == '0px') {
                s.css({'height':'auto','border-top':'none','overflow':'visible'});
                $(this).removeClass('maximizeResults').addClass('minimizeResults');
              } else {
                s.css({'height':'0','border-top':'1px solid #222','overflow':'hidden'});
                $(this).removeClass('minimizeResults').addClass('maximizeResults');
              }
            });
            minimizeInit = true;
          }
      });
      
      //
      
      $('.sidebarSearch button.addToMap').click(function(event){
        event.stopPropagation();
      });
   }  // end bindSearchHover
   
   function bindAccountHover() {
      
      var accountIsOpen = false
      
      // controls the sliding hover of the bottom left menu
      var sliding1 = false; 
      var lT;
      
      var closeAccount = function() {
        lT = setTimeout(function() { 
            if (! sliding1) { 
              sliding1 = true;
              $('.sidebarAccountIcon').css('background-color','#0F1519');
              $('.sidebarAccountBox').fadeOut(200, function() {
                sliding1 = false;
                accountIsOpen = false; 
              });
            } 
          },300); 
      }
      
      var openAccount = function() {
        clearTimeout(lT);
        if (! sliding1) { 
            sliding1 = true;
            
            // hide the other two
            $('.sidebarFilterBox').hide();
            $('.sidebarWandBox').hide();
            $('.sidebarFilterIcon').css('background-color','#0F1519');
            $('.sidebarWandIcon').css('background-color','#0F1519');
            
            $('.sidebarAccountIcon').css('background-color','#000');
            $('.sidebarAccountBox').fadeIn(200, function() {
                 sliding1 = false;
                 accountIsOpen = true;
            });
        }
      }
        // bind the hover events
        $(".sidebarAccount").hover(openAccount, closeAccount);
   } // end bindAccountHover
  
  // bind hover events  
  bindMainMenuHover();
  bindSearchHover();
  bindAccountHover();
  
  // disable right click events on the new topic and new synapse input fields
  $('#new_topic, #new_synapse').bind('contextmenu', function(e){
		return false;
	});
  
  // initialize the autocomplete results for the metacode spinner
  $('#topic_name').typeahead([
         {
            name: 'topic_autocomplete',
            limit: 8,
            template: '<img class="autocompleteSection topicType" width="22" height="22" src="{{typeImageURL}}" alt="{{type}}" title="{{type}}"/><p class="autocompleteSection topicTitle">{{label}}</p><div class="autocompleteSection topicPermission {{permission}}"></div><div class="autocompleteSection topicOriginatorIcon hoverForTip"><span class="tip topicOriginator">{{originator}}</span></div><div class="clearfloat"></div>',
            remote: {
                url: '/topics/autocomplete_topic?term=%QUERY'
            },
            engine: Hogan
          }
  ]);
  // tell the autocomplete to submit the form with the topic you clicked on if you pick from the autocomplete
  $('#topic_name').bind('typeahead:selected', function (event, datum, dataset) {
        $('#topic_grabTopic').val(datum.id);
		    event.preventDefault();
        event.stopPropagation();
  });
  // bind keyboard handlers
  $('#topic_name').bind('keyup', function(e) {
    switch(e.which) {
      case 13: 
        $('.new_topic').submit();
        break;
      default: break; 
    }
  });
  
  // initialize the autocomplete results for the metacode spinner
  $('#synapse_desc').typeahead([
         {
                name: 'synapse_autocomplete',
                template: "{{label}}",
                remote: {
                    url: '/search/synapses?term=%QUERY'
                },
                engine: Hogan
              },
              {
                name: 'existing_synapses',
                limit: 50,
                template: $('.synapseTemplate').html(),
                remote: {
                    url: '/search/synapses',
                    replace: function () {
                        var q = '/search/synapses?topic1id=' + $('#synapse_topic1id').val() + '&topic2id=' + $('#synapse_topic2id').val();
                        return q;
                    }
                },
                engine: Hogan,
                header: "<h3>Existing Synapses</h3>"
              },
  ]);
  // tell the autocomplete to submit the form with the topic you clicked on if you pick from the autocomplete
  $('#synapse_desc').bind('typeahead:selected', function (event, datum, dataset) {
        if (datum.id) { // if they clicked on an existing synapse get it
          $('#synapse_grabSynapse').val(datum.id);
		    }
        event.preventDefault();
        event.stopPropagation();
  });
  // bind keyboard handlers
  $('#synapse_desc').bind('keyup', function(e) {
    switch(e.which) {
      case 13: 
        $('.new_synapse').submit();
        break;
      default: break; 
    }
  });
	
  // when either form submits, don't leave the page
	$('.new_topic, .new_synapse').bind('submit', function(event, data){
      event.preventDefault();
  });
    
  
  //$(".scroll").mCustomScrollbar();
  
  // initialize scroll bar for filter by metacode, then hide it and position it correctly again
  $("#filter_by_metacode").mCustomScrollbar();
  $('.sidebarFilterBox').hide().css({
    position:'absolute',
    top: '35px',
    right: '-36px'
  });
  
  // initialize metacode spinner and then hide it
  $("#metacodeImg").CloudCarousel( {
			titleBox: $('#metacodeImgTitle'),
			yRadius:40,
			xPos: 150,
			yPos: 40,
			speed:0.3,
			mouseWheel:true, 
			bringToFront: true
	});
  $('.new_topic').hide();
  
  
  $('.notice.metamaps').delay(10000).fadeOut('fast');
  $('.alert.metamaps').delay(10000).fadeOut('fast');
  
  $('#center-container').bind('contextmenu', function(e){
		  return false;
	  });
  
  addHoverForSettings();
  
  //bind best_in_place ajax callbacks
  $('.best_in_place_desc').bind("ajax:success", function() {
    $(this).parents('.CardOnGraph').find('.scroll').mCustomScrollbar("update");
  });
  $('.best_in_place_link').bind("ajax:success", function() {
    var link = $(this).html();
    $(this).parents('.CardOnGraph').find('.go-link').attr('href', link);
  });
  
  //bind lightbox clicks
  $('.openLightbox').click(function() {
    openLightbox($(this).attr('data-open'));
  });
  
  // bind permission changer events
  $('.permIcon').click(function() {
    $(this).siblings('#map_permission').val( $(this).attr('data-permission') );
    $(this).siblings('.permIcon').find('.mapPermIcon').removeClass('selected');
    $(this).find('.mapPermIcon').addClass('selected');
  });
  
  // bind keyboard handlers
  $('body').bind('keyup', function(e) {
    switch(e.which) {
      case 13: enterKeyHandler(e); break;
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
  $('.sidebarSave .tip').html('Saving...');
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
  //$('.wandSaveLayout').html('Saved!');
  //setTimeout(function(){$('.wandSaveLayout').html('Save Layout')},1500);
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
  openLightbox('forkmap');
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

// @param node = JIT node object
// @param metacode = STRING like "Idea", "Action", etc.
function updateMetacode(node, metacode) {
  var mdata = { "topic": { "metacode": metacode } };
  $.ajax({
    type: "PUT",
    dataType: 'json',
    url: "/topics/" + node.id,
    data: mdata,
    success: function(data) {
      $('.CardOnGraph').find('.metacodeTitle').text(metacode);
      $('.CardOnGraph').find('.metacodeImage').css('background-image', 'url(' + imgArray[metacode].src + ')');
      node.setData("metacode", metacode);
      Mconsole.plot();
      $('.metacodeTitle').removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
      $('.metacodeSelect').hide();
      setTimeout(function() { $('.metacodeTitle').hide(); $('.showcard .icon').css('z-index','1'); }, 500);
    },
    error: function(){
      alert('failed to update metacode');
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

  $('.showcard').fadeIn('fast');
  var s = $('.showcard').find('.scroll');
  s.height( s.height() ).mCustomScrollbar();
  //node.setData('dim', 1, 'current');
  MetamapsModel.showcardInUse = node.id;
}

function openLightbox(which) {
  $('.lightboxContent').hide();
  $('#' + which).show();
  
  $('#lightbox_overlay').show();
  $('#lightbox_main').css('margin-top', '-' + ($('#lightbox_main').height() / 2) + 'px' );
}

function cancelMapCreate(id) {

 $('#lightbox_overlay').hide();
 
 var form = $('#' + id);

 form.find('#map_name').val('');
 form.find('#map_desc').val('');
 form.find('#map_permission').val('commons');

 if (id == "fork_map") {
  form.find('#map_topicsToMap').val('0');
  form.find('#map_synapsesToMap').val('0');
 }
 form.find('.mapPermIcon').removeClass('selected');
 form.find('.mapCommonsIcon').addClass('selected');
 
 return false;
}

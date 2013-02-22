// create filters for maps, and for card views

//  keep an array of which metacodes are currently visible.
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
		if (n.getData('metacode') == category) {
			n.setData('alpha', 0.4, 'end');
			n.eachAdjacency(function(adj) {  
			adj.setData('alpha', 0.4, 'end');  
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
		if (n.getData('metacode') == category) {
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

// Define the Find/Filters possibilities
var findTopics = ['name','metacode', 'mapper (by name)', 'map (by name)']
var findSynapses = ['topics (by name)', 'directionality', 'mapper (by name)', 'map (by name)']
var findMaps = ['name', 'topic (by name)', 'mapper (by name)', 'synapse (by topics)']
var findMappers = ['name', 'topic (by name)', 'map (by name)', 'synapse (by topics)']

// These functions toggle ALL nodes and synapses on the page
function hideAll(duration) {
    if (duration == null) duration = 500;
	Mconsole.graph.eachNode( function (n) {
		  if (!(n.getData('inCommons') || n.getData('onCanvas'))) {
        n.setData('alpha', 0.4, 'end');
        n.eachAdjacency(function(adj) {  
        adj.setData('alpha', 0.4, 'end');  
        });
      }        
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

/// Traverse the Graph and only show the searched for nodes
function onCanvasSearch(searchQuery, mapID, mapperID) {
  searchQuery = name.toLowerCase();
  Mconsole.graph.eachNode(function (n) {
    nodeName = n.name.toLowerCase();
    if (name != null) {
      if (nodeName.indexOf(searchQuery) !== -1 && searchQuery != "") {
        n.setData('onCanvas', true);
      }
      else {
        n.setData('onCanvas', false);
      }
    }
    else if (mapID != null) {
      if (n.getData('inmaps').indexOf(parseInt(mapID)) !== -1) {
        n.setData('onCanvas', true);
      }
      else {
        n.setData('onCanvas', false);
      }
    }
    else if (mapperID != null) {
      if (n.getData('userid').toString() == mapperID) {
        n.setData('onCanvas', true);
      }
      else {
        n.setData('onCanvas', false);
      }
    }
    Mconsole.plot();
  });
}//onCanvasSearch

function clearCanvas() {
  Mconsole.graph.eachNode(function(n) {
    Mconsole.graph.removeNode(n.id);
    Mconsole.labels.disposeLabel(n.id);
  });
  Mconsole.plot();
}

function clearCanvasExceptRoot() {
  var ids = new Array();
  Mconsole.graph.eachNode(function(n) {
    ids.push(n.id);
  });

  var root = Mconsole.graph.nodes[Mconsole.root];
  ids.forEach(function(id, index) {
    if (id != root.id) {
      Mconsole.graph.removeNode(id);
      //OK I feel bad about this, but not too bad
      //TODO: this leaves labels hidden on the map
      Mconsole.labels.hideLabel(id);
    }
  });
  fetchRelatives(root); //also runs Mconsole.plot()
}

function clearFoundData() {
  Mconsole.graph.eachNode( function(n) { 
    if (n.getData('inCommons') === true) {
      Mconsole.graph.removeNode(n.id);
      Mconsole.labels.disposeLabel(n.id);
    }
  });
  Mconsole.plot();
}

/**
 * Define all the dynamic interactions for the FIND/FILTER using Jquery
 */

$(document).ready(function() {
  // this sets up the initial opening of the find box
  $('#sideOptionFind').bind('click',function(){
    if (!findOpen) openFind();  
  });
   
  // this sets up the closing of the find box, and the toggling between open and closed.
  $('#closeFind').bind('click',function(){
    if (findOpen) closeFind();
  });
   
  // this is where interactions within the find box begin
  //on keyup, start the countdown
  $('#topic_by_name_input').typing({
    start: function (event, $elem) {
      // grab the checkboxes to see if the search is on the canvas, in the commons, or both
      firstVal = $("#onCanvas").attr('checked');
      secondVal = $("#inCommons").attr('checked');
      clearFoundData();
          
      // only have the autocomplete enabled if they are searching in the commons
      if (firstVal == "checked" && secondVal == "checked"){
        //$('#topic_by_name_input').autocomplete( "option", "disabled", false );
        $('#topic_by_name_input').autocomplete( "option", "disabled", true );
      }
      else if (firstVal == "checked"){
        setTimeout(function(){showAll();},0);
        $('#topic_by_name_input').autocomplete( "option", "disabled", true );
      }
      else if (secondVal == "checked"){
        //setTimeout(function(){hideAll();},0);
        //$('#topic_by_name_input').autocomplete( "option", "disabled", false );
        $('#topic_by_name_input').autocomplete( "option", "disabled", true );
      }
      else {
        alert('You either need to have searching On Your Canvas or In the Commons enabled');  
      }
    },
    stop: function (event, $elem) {
      // grab the checkboxes to see if the search is on the canvas, in the commons, or both
      firstVal = $("#onCanvas").attr('checked');
      secondVal = $("#inCommons").attr('checked');
            
      var topicName = $('#topic_by_name_input').val();
      // run a search on the canvas or in the commons or both
      if (firstVal == "checked" && secondVal == "checked") {
        setTimeout(function(){onCanvasSearch(topicName,null,null);},0);
        $('#topicsByName').val(topicName);
        $('#topicsByUser').val("");
        $('#topicsByMap').val("");
        $('#get_topics_form').submit();
      }
      else if (firstVal == "checked") {
        setTimeout(function(){onCanvasSearch(topicName,null,null);},0);
      }
      else if (secondVal == "checked") {
        $('#topicsByName').val(topicName);
        $('#topicsByUser').val("");
        $('#topicsByMap').val("");
        $('#get_topics_form').submit();
      }
      else {
        //do nothing
      }
            
      if (topicName == "") {
        clearFoundData();
      }
    },
    delay: 2000
  });

  $('#sideOptionFind .select_content').change(function() {
    firstVal = $(this).children("option[value='topics']").attr('selected');
    secondVal = $(this).children("option[value='maps']").attr('selected');
    thirdVal = $(this).children("option[value='mappers']").attr('selected');
    if (firstVal == 'selected') {
      $('#sideOptionFind .select_type').children("option[value='metacode']").removeAttr('disabled');
      $('#sideOptionFind .select_type').children("option[value='map (by name)']").removeAttr('disabled');
      $('#sideOptionFind .select_type').children("option[value='mapper (by name)']").removeAttr('disabled');
      $('.find').css('display','none');
      $('.find_topic_by_name').css('display','block');
      $('#topic_by_name_input').focus();
    }
    else if ( secondVal == 'selected' ) {
      if ( $("#sideOptionFind .select_type").val() != "name") { 
        $("#sideOptionFind .select_type").val('name');
        $('#sideOptionFind').animate({
          width: '305px',
          height: '76px'
        }, 300, function() {
          // Animation complete.
        });
      }
      $('#sideOptionFind .select_type').children("option[value='metacode']").attr('disabled','disabled');
      $('#sideOptionFind .select_type').children("option[value='map (by name)']").attr('disabled','disabled');
      $('#sideOptionFind .select_type').children("option[value='mapper (by name)']").attr('disabled','disabled');
      $('.find').css('display','none');
      $('.find_map_by_name').css('display','block');
      $('#map_by_name_input').focus();
    }
    else if ( thirdVal == 'selected' ) {
      $("#sideOptionFind .select_type").val('name');
      $('#sideOptionFind .select_type').children("option[value='metacode']").attr('disabled','disabled');
      $('#sideOptionFind .select_type').children("option[value='map (by name)']").attr('disabled','disabled');
      $('#sideOptionFind .select_type').children("option[value='mapper (by name)']").attr('disabled','disabled');
      $('.find').css('display','none');
      $('.find_mapper_by_name').css('display','block');
      $('#mapper_by_name_input').focus();
    }
  });
   
  $('#sideOptionFind .select_type').change(function() {
    firstVal = $(this).children("option[value='name']").attr('selected');
    secondVal = $(this).children("option[value='metacode']").attr('selected');
    thirdVal = $(this).children("option[value='map (by name)']").attr('selected');
    fourthVal = $(this).children("option[value='mapper (by name)']").attr('selected');
    if (firstVal === 'selected') {
      $('.find').fadeOut('fast', function() {
        showAll();
        $('.find_topic_by_metacode ul li').not('#hideAll, #showAll').removeClass('toggledOff');
        for (var catVis in categoryVisible) {
          categoryVisible[catVis] = true;
        }
        $('#sideOptionFind').animate({
          width: '305px',
          height: '76px'
        }, 300, function() {
          $('.find_topic_by_name').css('display','block');
          $('#topic_by_name_input').focus();
        });
      });
    }
    else if ( secondVal === 'selected' ) {
      $('.find').fadeOut('fast', function() {
        $('#sideOptionFind').animate({
          width: '380px',
          height: '463px'
        }, 300, function() {
          $('.find_topic_by_metacode').fadeIn('fast');
        }); 
      });
    }
    else if ( thirdVal === 'selected' ) {
      $('.find').fadeOut('fast', function() {
        $('#sideOptionFind').animate({
          width: '305px',
          height: '76px'
        }, 300, function() {
          $('.find_map_by_name').css('display','block'); 
          $('#map_by_name_input').focus();
        });  
      });
    }
    else if ( fourthVal === 'selected' ) {
      $('.find').fadeOut('fast', function() {
        $('#sideOptionFind').animate({
          width: '305px',
          height: '76px'
        }, 300, function() {
          $('.find_mapper_by_name').css('display','block'); 
          $('#mapper_by_name_input').focus();
        });  
      });
    }
  });
   
  $('.find_topic_by_name #topic_by_name_input').bind('railsAutocomplete.select', function(event, data) {
    /* Do something here */
    if (data.item.id != undefined) {
      window.open("/topics/" + data.item.id)
    }
    $('.find_topic_by_name #topic_by_name_input').val('');
  });
    
  $('.find_topic_by_name').bind('submit', function(event, data) {
    event.preventDefault();
  });
	
  $('.find_map_by_name #map_by_name_input').bind('railsAutocomplete.select', function(event, data) {
    firstVal = $('#sideOptionFind .select_content').children("option[value='topics']").attr('selected');
    secondVal = $('#sideOptionFind .select_content').children("option[value='maps']").attr('selected');
    thirdVal = $('#sideOptionFind .select_content').children("option[value='mappers']").attr('selected');
    if (firstVal == 'selected') {
      // grab the checkboxes to see if the search is on the canvas, in the commons, or both
      firstNewVal = $("#onCanvas").attr('checked');
      secondNewVal = $("#inCommons").attr('checked');

      // only have the autocomplete enabled if they are searching in the commons
      if (firstNewVal == "checked" && secondNewVal == "checked") {
        setTimeout(function(){onCanvasSearch(null,data.item.id,null);},0);
        $('#topicsByMap').val(data.item.id);
        $('#topicsByUser').val("");
        $('#topicsByName').val("");
        $('#get_topics_form').submit(); 
      }
      else if (firstNewVal == "checked") {
        setTimeout(function(){onCanvasSearch(null,data.item.id,null);},0); 
      }
      else if (secondNewVal == "checked"){
        //hideAll();
        $('#topicsByMap').val(data.item.id);
        $('#topicsByUser').val("");
        $('#topicsByName').val("");
        $('#get_topics_form').submit(); 
      }
      else {
        alert('You either need to have searching On Your Canvas or In the Commons enabled'); 
      }
    }
    else if ( secondVal == 'selected' ) {
      if (data.item.id != undefined) {
        window.open("/maps/" + data.item.id);
      }
      $('.find_map_by_name #map_by_name_input').val('');
    }
    else if ( thirdVal == 'selected' ) {
      //nothing
    }
  });
    
  $('.find_map_by_name').bind('submit', function(event, data){
    event.preventDefault();
  });
	
  $('.find_mapper_by_name #mapper_by_name_input').bind('railsAutocomplete.select', function(event, data){
    firstVal = $('#sideOptionFind .select_content').children("option[value='topics']").attr('selected');
    secondVal = $('#sideOptionFind .select_content').children("option[value='maps']").attr('selected');
    thirdVal = $('#sideOptionFind .select_content').children("option[value='mappers']").attr('selected');
    if ( firstVal == 'selected') {
      // grab the checkboxes to see if the search is on the canvas, in the commons, or both
      firstNewVal = $("#onCanvas").attr('checked');
      secondNewVal = $("#inCommons").attr('checked');

      // only have the autocomplete enabled if they are searching in the commons
      if (firstNewVal == "checked" && secondNewVal == "checked"){ 
        setTimeout(function(){onCanvasSearch(null,null,data.item.id.toString());},0);        
        $('#topicsByUser').val(data.item.id);
        $('#topicsByMap').val("");
        $('#topicsByName').val("");
        $('#get_topics_form').submit(); 
      }
      else if (firstNewVal == "checked"){
        setTimeout(function(){onCanvasSearch(null,null,data.item.id.toString());},0); 
      }
      else if (secondNewVal == "checked"){
        //hideAll();
        $('#topicsByUser').val(data.item.id);
        $('#topicsByMap').val("");
        $('#topicsByName').val("");
        $('#get_topics_form').submit(); 
      }
      else {
        alert('You either need to have searching On Your Canvas or In the Commons enabled'); 
      }
    }
    else if ( secondVal == 'selected' ) {
      //nothing
    }
    else if ( thirdVal == 'selected' ) {
      if (data.item.id != undefined) {
        window.open("/users/" + data.item.id);
      }
      $('.find_mapper_by_name #mapper_by_name_input').val('');
    }
  });
    
  $('.find_mapper_by_name').bind('submit', function(event, data){
    event.preventDefault();
  });

  // toggle visibility of topics with metacodes based on status in the filters list
  $('.find_topic_by_metacode ul li').click(function(event) {
    obj = document.getElementById('container');
        
    var switchAll = $(this).attr('id');
    if ( switchAll === "showAll" || switchAll === "hideAll") {
      if (switchAll == "showAll") {
        showAll();
        $('.find_topic_by_metacode ul li').not('#hideAll, #showAll').removeClass('toggledOff');
        for (var catVis in categoryVisible) {
          categoryVisible[catVis] = true;
        }
      }
      else if (switchAll == "hideAll") {
        hideAll();
        $('.find_topic_by_metacode ul li').not('#hideAll, #showAll').addClass('toggledOff');
        for (var catVis in categoryVisible) {
          categoryVisible[catVis] = false;
        }
      }
    }
    else {
      var category = $(this).children('img').attr('alt');
      switchVisible(category);
  
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
  
function openFind() {
  findOpen = true;
  if (analyzeOpen) closeAnalyze();
  if (organizeOpen) closeOrganize();
  $('#sideOptionFind, #closeFind').css('z-index','10');
  $('#sideOptionAnalyze').css('z-index','9');
  $('#sideOptionOrganize').css('z-index','8');
  firstVal = $('#sideOptionFind option[value="name"]').attr('selected');
  secondVal = $('#sideOptionFind option[value="metacode"]').attr('selected');
  thirdVal = $('#sideOptionFind option[value="map (by name)"]').attr('selected');
  fourthVal = $('#sideOptionFind option[value="mapper (by name)"]').attr('selected');
  if ( firstVal === 'selected' || thirdVal === 'selected' || fourthVal === 'selected' ) {
    $('#sideOptionFind').animate({
    width: '305px',
      height: '76px'
    }, 100, function() {
      $('#topic_by_name_input').focus();
    });
  } else if ( secondVal === 'selected') {
    $('#sideOptionFind').animate({
    width: '380px',
    height: '463px'
    }, 100, function() {
      // Animation complete.
    });
  } else if ( thirdVal === 'selected' ) {
    $('#sideOptionFind').animate({
    width: '305px',
      height: '76px'
    }, 100, function() {
      $('#map_by_name_input').focus();
    });
  } else if ( fourthVal === 'selected' ) {
    $('#sideOptionFind').animate({
    width: '305px',
      height: '76px'
    }, 100, function() {
      $('#mapper_by_name_input').focus();
    });
  }
  $('#closeFind, #findWhere').css('display','block');
  $('#sideOptionFind').css('cursor','default');
}

function closeFind() {
  findOpen = false;
  Mconsole.graph.eachNode( function (n) {
    n.setData('inCommons', false);
    n.setData('onCanvas', false);
   });
   Mconsole.plot();
   $('#closeFind, #findWhere').css('display','none');
   $('#sideOptionFind').css('cursor','pointer');
   $('#sideOptionFind').animate({
     width: '45px',
     height: '32px'
     }, 100);
}

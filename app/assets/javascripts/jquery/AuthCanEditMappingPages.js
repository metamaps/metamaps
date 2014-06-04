/* authCanEditMappingPages means:
1. being logged in and,
2. either 
    a. being on a Map page and having edit permissions (your map, or commons map) or,
    b. being on a Topic page
    
this code adds required jQuery for creating, or pulling in, topics and synapses
*/

$(document).ready(function () {

    //////
    //////
    //// TOPIC CREATION

    // initialize the autocomplete results for the metacode spinner
    $('#topic_name').typeahead([
        {
            name: 'topic_autocomplete',
            limit: 8,
            template: $('#topicAutocompleteTemplate').html(),
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
    $('#topic_name').bind('keyup', function (e) {
        switch (e.which) {
        case 13:
            $('.new_topic').submit();
            break;
        default:
            break;
        }
    });

    // initialize metacode spinner and then hide it
    $("#metacodeImg").CloudCarousel({
        titleBox: $('#metacodeImgTitle'),
        yRadius: 40,
        xPos: 150,
        yPos: 40,
        speed: 0.3,
        mouseWheel: true,
        bringToFront: true
    });
    $('.new_topic').hide();


    //////
    //////
    //// SYNAPSE CREATION

    // initialize the autocomplete results for synapse creation
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
            template: $('#synapseAutocompleteTemplate').html(),
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
    $('#synapse_desc').bind('keyup', function (e) {
        switch (e.which) {
        case 13:
            $('.new_synapse').submit();
            break;
        default:
            break;
        }
    });


    //////
    //////
    //// TOPIC AND SYNAPSE CREATION

    // when either form submits, don't leave the page
    $('.new_topic, .new_synapse').bind('submit', function (event, data) {
        event.preventDefault();
    });

    // disable right click events on the new topic and new synapse input fields
    $('#new_topic, #new_synapse').bind('contextmenu', function (e) {
        return false;
    });

    //////
    //////
    //// SWITCHING METACODE SETS

    $('#metacodeSwitchTabs').tabs({
        selected: MetamapsModel.selectedMetacodeSetIndex
    }).addClass("ui-tabs-vertical ui-helper-clearfix");
    $("#metacodeSwitchTabs .ui-tabs-nav li").removeClass("ui-corner-top").addClass("ui-corner-left");
    $("#metacodeSwitchTabs .ui-tabs-nav li a").click(function(){
        // recenter the lightbox when you switch tabs
        $('#lightbox_main').css('margin-top', '-' + ($('#lightbox_main').height() / 2) + 'px');
    });
    /*$("#metacodeSetCustom").click(function () {
        if (!MetamapsModel.metacodeScrollerInit) {
            $('.customMetacodeList, .metacodeSetList').mCustomScrollbar({advanced: { updateOnContentResize: true }});
            MetamapsModel.metacodeScrollerInit = true;
        }
    });*/
    $('.customMetacodeList li').click(function () {
        if ($(this).attr('class') != 'toggledOff') {
            $(this).addClass('toggledOff');
            var value_to_remove = $(this).attr('id');
            var name_to_remove = $(this).attr('data-name');
            MetamapsModel.newSelectedMetacodes.splice(MetamapsModel.newSelectedMetacodes.indexOf(value_to_remove), 1);
            MetamapsModel.newSelectedMetacodeNames.splice(MetamapsModel.newSelectedMetacodeNames.indexOf(name_to_remove), 1);
        } else if ($(this).attr('class') == 'toggledOff') {
            $(this).removeClass('toggledOff');
            MetamapsModel.newSelectedMetacodes.push($(this).attr('id'));
            MetamapsModel.newSelectedMetacodeNames.push($(this).attr('data-name'));
        }
    });


}); // end document.ready
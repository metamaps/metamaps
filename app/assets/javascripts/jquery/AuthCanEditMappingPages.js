/* authCanEditMappingPages means:
1. being logged in and,
2. either 
    a. being on a Map page and having edit permissions (your map, or commons map) or,
    b. being on a Topic page
    
this code adds required jQuery for creating, or pulling in, topics and synapses
*/

$(document).ready(function () {

    function bindForkHover() {
        var closeFork = function () {

        }

        var openFork = function () {
                // hide the other three
                $('.sidebarFilterBox, .sidebarAccountBox, .sidebarCollaborateBox').hide();
                $('.sidebarFilterIcon, .sidebarCollaborateIcon').css('background-color', '#0F1519');
            }
        // bind the hover events
        $(".sidebarFork").hover(openFork, closeFork);
    } // end bindForkHover

    // bind hover events  
    bindForkHover();

    //////
    //////
    //// SWITCHING METACODE SETS

    $('#metacodeSwitchTabs').tabs({
        selected: Metamaps.Settings.selectedMetacodeSetIndex
    }).addClass("ui-tabs-vertical ui-helper-clearfix");
    $("#metacodeSwitchTabs .ui-tabs-nav li").removeClass("ui-corner-top").addClass("ui-corner-left");
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
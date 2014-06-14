/* AllMappingPages means:
1. being logged in or logged out and,
2. either 
    a. being on a Map page, or
    b. being on a Topic page
    

*/

$(document).ready(function () {
    
    // initialize topic card draggability and resizability
    $('.showcard').draggable({
        handle: ".metacodeImage"
    });
    $('#showcard').resizable({
        maxHeight: 500,
        maxWidth: 500,
        minHeight: 320,
        minWidth: 226,
        resize: function (event, ui) {
            var p = $('#showcard').find('.scroll');
            p.height(p.height()).mCustomScrollbar('update');
        }
    }).css({
        display: 'none',
        top: '300px',
        left: '100px'
    });
    
    function bindFilterHover() {

        var filterIsOpen = false;

        // controls the sliding hover of the bottom left menu
        var sliding1 = false;
        var lT;

        var closeFilter = function () {
            lT = setTimeout(function () {
                if (!sliding1) {
                    sliding1 = true;
                    $('.sidebarFilterIcon').css('background-color', '#0F1519');
                    $('.sidebarFilterBox').fadeOut(200, function () {
                        sliding1 = false;
                        filterIsOpen = false;
                    });
                }
            }, 300);
        }

        var openFilter = function () {
                clearTimeout(lT);
                if (!sliding1) {
                    sliding1 = true;

                    // hide the other two
                    $('.sidebarAccountBox').hide();
                    $('.sidebarCollaborateBox').hide();
                    $('.sidebarAccountIcon').css('background-color', '#0F1519');
                    $('.sidebarCollaborateIcon').css('background-color', '#0F1519');

                    $('.sidebarFilterIcon').css('background-color', '#000');
                    $('.sidebarFilterBox').fadeIn(200, function () {
                        sliding1 = false;
                        filterIsOpen = true;
                    });
                }
            }
            // bind the hover events
        $(".sidebarFilter").hover(openFilter, closeFilter);

    } // end bindFilterHover
    
    bindFilterHover();
    
    // initialize scroll bar for filter by metacode, then hide it and position it correctly again
    $("#filter_by_metacode").mCustomScrollbar({
        mouseWheelPixels: 200,
        advanced: {
            updateOnContentResize: true
        }
    });
    $('.sidebarFilterBox').hide().css({
        position: 'absolute',
        top: '35px',
        right: '-36px'
    });
    
    // prevent right clicks on the main canvas, so as to not get in the way of our right clicks
    $('#center-container').bind('contextmenu', function (e) {
        return false;
    });
    
    // tab the cheatsheet
    $('#cheatSheet').tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
    $("#cheatSheet .ui-tabs-nav li").removeClass("ui-corner-top").addClass("ui-corner-left");
}); // end document.ready
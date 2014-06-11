/* authCanEditMapPage means:
1. being logged in and,
2. being on a Map page and having edit permissions (your map, or commons map)
    

*/

$(document).ready(function () {

    function bindRealtimeHover() {

        var realtimeIsOpen = false

        // controls the sliding hover of the bottom left menu
        var sliding1 = false;
        var lT;

        var closeRealtime = function () {
            lT = setTimeout(function () {
                if (!sliding1) {
                    sliding1 = true;
                    $('.sidebarCollaborateIcon').css('background-color', '#0F1519');
                    $('.sidebarCollaborateBox').fadeOut(200, function () {
                        sliding1 = false;
                        realtimeIsOpen = false;
                    });
                }
            }, 300);
        }

        var openRealtime = function () {
                clearTimeout(lT);
                if (!sliding1) {
                    sliding1 = true;

                    // hide the other two
                    $('.sidebarFilterBox').hide();
                    $('.sidebarAccountBox').hide();
                    $('.sidebarFilterIcon').css('background-color', '#0F1519');
                    $('.sidebarAccountIcon').css('background-color', '#0F1519');

                    $('.sidebarCollaborateIcon').css('background-color', '#000');
                    $('.sidebarCollaborateBox').fadeIn(200, function () {
                        sliding1 = false;
                        realtimeIsOpen = true;
                    });
                }
            }
            // bind the hover events
        $(".sidebarCollaborate").hover(openRealtime, closeRealtime);
    } // end bindRealtimeHover

    function bindSaveHover() {
        var closeSave = function () {

        }

        var openSave = function () {
                // hide the other three
                $('.sidebarFilterBox, .sidebarAccountBox, .sidebarCollaborateBox').hide();
                $('.sidebarFilterIcon, .sidebarAccountIcon, .sidebarCollaborateIcon').css('background-color', '#0F1519');
            }
        // bind the hover events
        $(".sidebarSave").hover(openSave, closeSave);
    } // end bindSaveHover

    // bind hover events  
    bindRealtimeHover();
    bindSaveHover();

    // because anyone who can edit the map can collaborate on it in realtime
    $(".realtimeOnOff").click(function (event) {
        if (!goRealtime) {
            window.realtime.sendRealtimeOn();
            $(this).html('ON').removeClass('rtOff').addClass('rtOn');
            $(".rtMapperSelf").removeClass('littleRtOff').addClass('littleRtOn');
        } else {
            window.realtime.sendRealtimeOff();
            $(this).html('OFF').removeClass('rtOn').addClass('rtOff');
            $(".rtMapperSelf").removeClass('littleRtOn').addClass('littleRtOff');
        }
        goRealtime = !goRealtime;
        $(".sidebarCollaborateIcon").toggleClass("blue");
    });

    // because anyone who can edit the map can save a new map layout
    $('.sidebarSave').click(function () {
        saveLayoutAll();
    });

    // because anyone who can edit the map can change the map title
    $('.mapInfoName .best_in_place_name').bind("ajax:success", function () {
        var name = $(this).html();
        $('.mapName').html(name);
    });

}); // end document.ready
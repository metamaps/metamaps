/* authCanEditMapPage means:
1. being logged in and,
2. being on a Map page and having edit permissions (your map, or commons map)
    

*/

$(document).ready(function () {

    // because anyone who can edit the map can collaborate on it in realtime
    $(".sidebarCollaborateIcon").click(function (event) {
        if (!goRealtime) {
            window.realtime.sendRealtimeOn();
            $('.sidebarCollaborate .tip').html('Stop Realtime Collaboration');
        } else {
            window.realtime.sendRealtimeOff();
            $('.sidebarCollaborate .tip').html('Start Realtime Collaboration');
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
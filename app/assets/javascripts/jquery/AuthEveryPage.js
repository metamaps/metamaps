/* authEveryPage means:
1. being logged in and on any page on metamaps
    
this code adds required jQuery for the create map lightBox that can be used from any page on metamaps
*/

$(document).ready(function () {
    
    // bind permission changer events on the createMap form
    $('.permIcon').click(function () {
        $(this).siblings('#map_permission').val($(this).attr('data-permission'));
        $(this).siblings('.permIcon').find('.mapPermIcon').removeClass('selected');
        $(this).find('.mapPermIcon').addClass('selected');
    });
    
}); // end document.ready
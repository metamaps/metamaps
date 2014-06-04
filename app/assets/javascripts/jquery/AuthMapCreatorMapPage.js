/* AuthMapCreatorMapPage means:
1. being on a Map page
2. being the original creator of that map
    

*/

$(document).ready(function () {

    // ability to change permission of the map
    var selectingPermission = false;
    $('.yourMap .mapPermission').click(function () {
        if (!selectingPermission) {
            selectingPermission = true;
            $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
            if ($(this).hasClass('commons')) {
                $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>');
            } else if ($(this).hasClass('public')) {
                $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>');
            } else if ($(this).hasClass('private')) {
                $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>');
            }
            $('.mapPermission .permissionSelect li').click(function (event) {
                selectingPermission = false;
                var permission = $(this).attr('class');
                updateMapPermission(mapid, permission);
                event.stopPropagation();
            });
        } else {
            selectingPermission = false;
            $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
            $('.mapPermission .permissionSelect').remove();
        }
    }); 
    
}); // end document.ready
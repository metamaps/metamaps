/* AuthAllMappingPages means:
1. being logged in and,
2. either 
    a. being on a Map page, or
    b. being on a Topic page
    

*/

$(document).ready(function () {
    
    $('.sidebarFork').click(function () {
        saveToMap();
    });
    
    // initialize best_in_place editing
    $('.authenticated div.permission.canEdit .best_in_place').best_in_place();
    
}); // end document.ready
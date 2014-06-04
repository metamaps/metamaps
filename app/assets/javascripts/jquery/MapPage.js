/* MapPage means:
1. being on a Map page
    

*/

$(document).ready(function () {

    function bindInfoHover() {

        var infoIsOpen = false;

        // controls the sliding hover of the bottom left menu
        var sliding1 = false;
        var lT;

        var closeInfo = function () {
            lT = setTimeout(function () {
                if (!sliding1) {
                    sliding1 = true;
                    $('.mapInfoBox').fadeOut(200, function () {
                        sliding1 = false;
                        infoIsOpen = false;
                    });
                }
            }, 300);
        }

        var openInfo = function (event) {
                clearTimeout(lT);
                if (!sliding1 && event.target.className != "openCheatsheet openLightbox") {
                    sliding1 = true;

                    $('.mapInfoBox').fadeIn(200, function () {
                        sliding1 = false;
                        infoIsOpen = true;
                    });
                }
            }
            // bind the hover events
        $("div.index").hover(openInfo, closeInfo);


    } // end bindInfoHover

    bindInfoHover();
    
}); // end document.ready
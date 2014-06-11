// everything in this document.ready function is here because it is needed on every single page on metamaps
$(document).ready(function () {

    function bindMainMenuHover() {

        var menuIsOpen = false

        // controls the sliding hover of the bottom left menu
        var sliding1 = false;
        var lT;

        var closeMenu = function () {
            lT = setTimeout(function () {
                if (!sliding1) {
                    sliding1 = true;
                    // $('.footer .menu').animate({
                    // height: '0px'
                    // }, 300, function() {
                    // sliding1 = false;
                    // menuIsOpen = false;
                    // });
                    $('.footer').css('border-top-right-radius', '5px');
                    $('.logo').animate({
                        'background-position-x': '-10px'
                    }, 200);
                    $('.footer .menu').fadeOut(200, function () {
                        sliding1 = false;
                        menuIsOpen = false;
                    });
                }
            }, 500);
        }

        var openMenu = function () {
                clearTimeout(lT);
                if (!sliding1) {
                    sliding1 = true;

                    // $('.footer .menu').animate({
                    // height: listLength + 'px'
                    // }, 300, function() {
                    // sliding1 = false;
                    // });
                    $('.footer').css('border-top-right-radius', '0');
                    $('.logo').animate({
                        'background-position-x': '-7px'
                    }, 200);
                    $('.footer .menu').fadeIn(200, function () {
                        sliding1 = false;
                    });
                }
            }
            // bind the hover events
        $(".logo").hover(openMenu, closeMenu);

        // when on touch screen, make touching on the logo do what hovering does on desktop
        $("#mainTitle a").bind('touchend', function (evt) {
            if (!menuIsOpen) {
                openMenu();
                evt.preventDefault();
                evt.stopPropagation();
            }
        });
    }

    function bindSearchHover() {

        var searchIsOpen = false

        // controls the sliding hover of the search
        var sliding1 = false;
        var lT;

        var openSearch = function () {
            clearTimeout(lT);
            if (!sliding1 && !searchIsOpen) {
                hideCards();
                sliding1 = true;
                $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
                    width: '200px'
                }, 200, function () {
                    $('.sidebarSearchField, .sidebarSearch .tt-hint').css({
                        padding: '5px 10px',
                        width: '180px'
                    });
                    $('.sidebarSearchField').focus();
                    sliding1 = false
                    searchIsOpen = true;
                });
            }
        }
        var closeSearch = function (closeAfter, bypass) {
            lT = setTimeout(function () {
                if (!sliding1 && searchIsOpen && (bypass || $('.sidebarSearchField').val() == '')) {
                    sliding1 = true;
                    $('.sidebarSearchField, .sidebarSearch .tt-hint').css({
                        padding: '5px 0',
                        width: '200px'
                    });
                    $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
                        width: '0'
                    }, 200, function () {
                        $('.sidebarSearchField').typeahead('setQuery', '');
                        $('.sidebarSearchField').blur();
                        sliding1 = false;
                        searchIsOpen = false;
                    });
                }
            }, closeAfter);
        }

        // bind the hover events
        $(".sidebarSearch").hover(function () {
            openSearch()
        }, function () {
            closeSearch(800, false)
        });

        $('.sidebarSearchIcon').click(function (e) {
            $('.sidebarSearchField').focus();
        });
        $('.sidebarSearch').click(function (e) {
            e.stopPropagation();
        });
        $('body').click(function (e) {
            closeSearch(0, false);
        });

        // if the search is closed and user hits ctrl+/
        // close if they hit ESC
        $('body').bind('keydown', function (e) {
            switch (e.which) {
            case 191:
                if (e.ctrlKey && !searchIsOpen) {
                    openSearch();
                }
                break;
            case 27:
                if (searchIsOpen) {
                    closeSearch(0, true);
                }
                break;     
            default:
                break; //console.log(e.which);
            }
        });

        // initialize the search box autocomplete results
        var mapheader = userid ? '<h3 class="search-header">Maps</h3><input type="checkbox" class="limitToMe" id="limitMapsToMe"></input><label for="limitMapsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div>' : '<h3 class="search-header">Maps</h3><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div>';
        var topicheader = userid ? '<h3 class="search-header">Topics</h3><input type="checkbox" class="limitToMe" id="limitTopicsToMe"></input><label for="limitTopicsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div>' : '<h3 class="search-header">Topics</h3><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div>';
        $('.sidebarSearchField').typeahead([
            {
                name: 'topics',
                limit: 9999,
                dupChecker: function (datum1, datum2) {
                    return false;
                },
                template: $('#topicSearchTemplate').html(),
                remote: {
                    url: '/search/topics?term=%QUERY',
                    replace: function () {
                        var q = '/search/topics?term=' + $('.sidebarSearchField').val();
                        if ($("#limitTopicsToMe").is(':checked')) {
                            q += "&user=" + userid.toString();
                        }
                        return q;
                    },
                    filter: function (dataset) {
                        if (dataset.length == 0) {
                            dataset.push({
                                value: "No results",
                                label: "No results",
                                typeImageURL: "/assets/icons/wildcard.png",
                                rtype: "noresult"
                            });
                        }
                        return dataset;
                    }
                },
                engine: Hogan,
                header: topicheader
              },
            {
                name: 'maps',
                limit: 9999,
                dupChecker: function (datum1, datum2) {
                    return false;
                },
                template: $('#mapSearchTemplate').html(),
                remote: {
                    url: '/search/maps?term=%QUERY',
                    replace: function () {
                        var q = '/search/maps?term=' + $('.sidebarSearchField').val();
                        if ($("#limitMapsToMe").is(':checked')) {
                            q += "&user=" + userid.toString();
                        }
                        return q;
                    },
                    filter: function (dataset) {
                        if (dataset.length == 0) {
                            dataset.push({
                                value: "No results",
                                label: "No results",
                                rtype: "noresult"
                            });
                        }
                        return dataset;
                    }
                },
                engine: Hogan,
                header: mapheader
              },
            {
                name: 'mappers',
                limit: 9999,
                dupChecker: function (datum1, datum2) {
                    return false;
                },
                template: $('#mapperSearchTemplate').html(),
                remote: {
                    url: '/search/mappers?term=%QUERY',
                    filter: function (dataset) {
                        if (dataset.length == 0) {
                            dataset.push({
                                value: "No results",
                                label: "No results",
                                rtype: "noresult"
                            });
                        }
                        return dataset;
                    }
                },
                engine: Hogan,
                header: '<h3 class="search-header">Mappers</h3><div class="minimizeResults minimizeMapperResults"></div><div class="clearfloat"></div>'
              }
      ]);

        //Set max height of the search results box to prevent it from covering bottom left footer
        $('.sidebarSearchField').bind('typeahead:opened', function (event) {
            var h = $(window).height();
            $(".tt-dropdown-menu").css('max-height', h - 100);
        });
        $(window).resize(function () {
            var h = $(window).height();
            $(".tt-dropdown-menu").css('max-height', h - 100);
        });


        // tell the autocomplete to launch a new tab with the topic, map, or mapper you clicked on
        $('.sidebarSearchField').bind('typeahead:selected', function (event, datum, dataset) {
            console.log(event);
            if (datum.rtype != "noresult") {
                var win;
                if (dataset == "topics") {
                    win = window.open('/topics/' + datum.id, '_blank');
                } else if (dataset == "maps") {
                    win = window.open('/maps/' + datum.id, '_blank');
                } else if (dataset == "mappers") {
                    win = window.open('/maps/mappers/' + datum.id, '_blank');
                }
                win.focus();
                closeSearch(0);
            }
        });


        var checkboxChangeInit = false,
            minimizeInit = false;

        $('.sidebarSearchField').bind('keyup', function () {

            // when the user selects 'added by me' resend the query with their userid attached
            if (!checkboxChangeInit) {
                $('.limitToMe').bind("change", function (e) {
                    // set the value of the search equal to itself to retrigger the autocomplete event
                    searchIsOpen = false;
                    $('.sidebarSearchField').typeahead('setQuery', $('.sidebarSearchField').val());
                    setTimeout(function () {
                        searchIsOpen = true;
                    }, 2000);
                });
                checkboxChangeInit = true;
            }

            // when the user clicks minimize section, hide the results for that section
            if (!minimizeInit) {
                $('.minimizeMapperResults').click(function (e) {
                    var s = $('.tt-dataset-mappers .tt-suggestions');
                    console.log(s.css('height'));
                    if (s.css('height') == '0px') {
                        $('.tt-dataset-mappers .tt-suggestions').css({
                            'height': 'auto',
                            'overflow': 'visible'
                        });
                        $(this).removeClass('maximizeResults').addClass('minimizeResults');
                    } else {
                        $('.tt-dataset-mappers .tt-suggestions').css({
                            'height': '0',
                            'overflow': 'hidden'
                        });
                        $(this).removeClass('minimizeResults').addClass('maximizeResults');
                    }
                });
                $('.minimizeTopicResults').click(function (e) {
                    var s = $('.tt-dataset-topics .tt-suggestions');
                    console.log(s.css('height'));
                    if (s.css('height') == '0px') {
                        s.css({
                            'height': 'auto',
                            'border-top': 'none',
                            'overflow': 'visible'
                        });
                        $(this).removeClass('maximizeResults').addClass('minimizeResults');
                    } else {
                        s.css({
                            'height': '0',
                            'border-top': '1px solid rgb(56, 56, 56)',
                            'overflow': 'hidden'
                        });
                        $(this).removeClass('minimizeResults').addClass('maximizeResults');
                    }
                });
                $('.minimizeMapResults').click(function (e) {
                    var s = $('.tt-dataset-maps .tt-suggestions');
                    console.log(s.css('height'));
                    if (s.css('height') == '0px') {
                        s.css({
                            'height': 'auto',
                            'border-top': 'none',
                            'overflow': 'visible'
                        });
                        $(this).removeClass('maximizeResults').addClass('minimizeResults');
                    } else {
                        s.css({
                            'height': '0',
                            'border-top': '1px solid rgb(56, 56, 56)',
                            'overflow': 'hidden'
                        });
                        $(this).removeClass('minimizeResults').addClass('maximizeResults');
                    }
                });
                minimizeInit = true;
            }
        });

        //

        $('.sidebarSearch button.addToMap').click(function (event) {
            event.stopPropagation();
        });
    } // end bindSearchHover

    function bindAccountHover() {

        var accountIsOpen = false

        // controls the sliding hover of the bottom left menu
        var sliding1 = false;
        var lT;

        var closeAccount = function () {
            lT = setTimeout(function () {
                if (!sliding1) {
                    sliding1 = true;
                    $('.sidebarAccountIcon').css('background-color', '#0F1519');
                    $('.sidebarAccountBox').fadeOut(200, function () {
                        sliding1 = false;
                        accountIsOpen = false;
                    });
                }
            }, 300);
        }

        var openAccount = function () {
                clearTimeout(lT);
                if (!sliding1) {
                    sliding1 = true;

                    // hide the other two
                    $('.sidebarFilterBox').hide();
                    $('.sidebarCollaborateBox').hide();
                    $('.sidebarFilterIcon').css('background-color', '#0F1519');
                    $('.sidebarCollaborateIcon').css('background-color', '#0F1519');

                    $('.sidebarAccountIcon').css('background-color', '#000');
                    $('.sidebarAccountBox').fadeIn(200, function () {
                        sliding1 = false;
                        accountIsOpen = true;
                    });
                }
            }
            // bind the hover events
        $(".sidebarAccount").hover(openAccount, closeAccount);
    } // end bindAccountHover

    // bind hover events  
    bindMainMenuHover();
    bindSearchHover();
    bindAccountHover();

    // hide notices after 10 seconds
    $('.notice.metamaps').delay(10000).fadeOut('fast');
    $('.alert.metamaps').delay(10000).fadeOut('fast');

    //bind lightbox clicks
    $('.openLightbox').click(function (event) {
        openLightbox($(this).attr('data-open'));
        event.preventDefault();
        return false;
    });

    // bind keyboard handlers
    $('body').bind('keyup', function (e) {
        switch (e.which) {
        case 13:
            enterKeyHandler(e);
            break;
        case 27:
            escKeyHandler();
            break;
        default:
            break; //console.log(e.which);
        }
    });

}); // end document.ready
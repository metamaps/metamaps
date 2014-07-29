var Metamaps = {}; // this variable declaration defines a Javascript object that will contain all the variables and functions used by us, broken down into 'sub-modules' that look something like this
/*

* unless you are on a page with the Javascript InfoVis Toolkit (Topic or Map) the only section in the metamaps 
* object will be this one
GlobalUI

* all these get added when you are on a page with the Javascript Infovis Toolkit
Settings
Touch
Mouse
Active
Selected
Maps
Mappers
Metacodes
Topics
Synapses
Mappings
Backbone
Create
TopicCard
SynapseCard
Visualize
Util
Realtime
Control
Filter
Listeners
Organize
Topic
Synapse
Map
Mapper
JIT 
*/


$(document).ready(function () {

    for (var prop in Metamaps) {
        
        // this runs the init function within each sub-object on the Metamaps one
        if (Metamaps.hasOwnProperty(prop) &&
            Metamaps[prop].hasOwnProperty('init') &&
            typeof (Metamaps[prop].init) == 'function'
        ) {
            Metamaps[prop].init();
        }
    }

    //Metamaps.Visualize.type = "ForceDirected3D";
    // this line could maybe go at the end of the Metamaps.JIT init function
    if (Metamaps.JIT) Metamaps.JIT.prepareVizData();
});

Metamaps.GlobalUI = {
    notifyTimeout: null,
    init: function () {
        var self = Metamaps.GlobalUI;

        self.Search.init();
        self.MainMenu.init();
        self.CreateMap.init();
        self.Account.init();

        //bind lightbox clicks
        $('.openLightbox').click(function (event) {
            self.openLightbox($(this).attr('data-open'));
            event.preventDefault();
            return false;
        });

        // hide notices after 10 seconds
        $('.notice.metamaps').delay(10000).fadeOut('fast');
        $('.alert.metamaps').delay(10000).fadeOut('fast');
    },
    openLightbox: function (which) {
        $('.lightboxContent').hide();
        $('#' + which).show();

        $('#lightbox_overlay').show();
        $('#lightbox_main').css('margin-top', '-' + ($('#lightbox_main').height() / 2) + 'px');

        if (Metamaps.Create && !Metamaps.Create.metacodeScrollerInit) {
            $('.customMetacodeList, .metacodeSetList').mCustomScrollbar({
                mouseWheelPixels: 200,
                advanced: {
                    updateOnContentResize: true
                }
            });
            Metamaps.Create.metacodeScrollerInit = true;
        }
        if (which == "switchMetacodes") {
            Metamaps.Create.isSwitchingSet = true;
        }
    },

    closeLightbox: function () {
        $('#lightbox_overlay').hide();
        Metamaps.GlobalUI.CreateMap.reset('fork_map');
        Metamaps.GlobalUI.CreateMap.reset('new_map');
        if (Metamaps.Create && Metamaps.Create.isSwitchingSet) {
            Metamaps.Create.cancelMetacodeSetSwitch();
        }
    },
    notifyUser: function (message) {
        var self = Metamaps.GlobalUI;
        
        if ($('.notice.metamaps').length == 0) {
            $('body').prepend('<div class="notice metamaps" />');
        }
        $('.notice.metamaps').hide().html(message).fadeIn('fast');

        clearTimeout(self.notifyTimeOut);
        self.notifyTimeOut = setTimeout(function () {
            $('.notice.metamaps').fadeOut('fast');
        }, 8000);
    }
};

Metamaps.GlobalUI.MainMenu = {
    isOpen: false,
    timeOut: null,
    changing: false,
    init: function () {
        var self = Metamaps.GlobalUI.MainMenu;

        $(".logo").hover(self.open, self.close);

        // when on touch screen, make touching on the logo do what hovering does on desktop
        $("#mainTitle a").bind('touchend', function (evt) {
            if (!self.isOpen) {
                self.openMenu();
                evt.preventDefault();
                evt.stopPropagation();
            }
        });
    },
    open: function () {
        var self = Metamaps.GlobalUI.MainMenu;

        clearTimeout(self.timeOut);
        if (!self.isOpen && !self.changing) {
            self.changing = true;

            // toggle the upper right rounded corner off
            $('.footer').css('border-top-right-radius', '0');

            // move the hamburger menu icon a little bit further out
            $('.logo').animate({
                'background-position-x': '-7px'
            }, 200);

            // fade the main part of the menu in
            $('.footer .menu').fadeIn(200, function () {
                self.changing = false;
                self.isOpen = true;
            });
        }
    },
    close: function () {
        var self = Metamaps.GlobalUI.MainMenu;

        self.timeOut = setTimeout(function () {
            if (!self.changing) {
                self.changing = true;

                // set back to having a rounder upper right corner
                $('.footer').css('border-top-right-radius', '5px');

                // move the hamburger menu icon further to the left, more hidden again
                $('.logo').animate({
                    'background-position-x': '-10px'
                }, 200);

                // fade out the main menu
                $('.footer .menu').fadeOut(200, function () {
                    self.changing = false;
                    self.isOpen = false;
                });
            }
        }, 500);
    }
};


Metamaps.GlobalUI.CreateMap = {
    init: function () {
        
        // bind permission changer events on the createMap form
        $('.permIcon').click(function () {
            $(this).siblings('#map_permission').val($(this).attr('data-permission'));
            $(this).siblings('.permIcon').find('.mapPermIcon').removeClass('selected');
            $(this).find('.mapPermIcon').addClass('selected');
        });
        
    },
    reset: function (id) {

        var form = $('#' + id);

        form.find('#map_name').val('');
        form.find('#map_desc').val('');
        form.find('#map_permission').val('commons');

        if (id == "fork_map") {
            form.find('#map_topicsToMap').val('0');
            form.find('#map_synapsesToMap').val('0');
        }

        // remove a selected state from all three of them
        form.find('.mapPermIcon').removeClass('selected');
        // add a selected state back to commons permission, the default
        form.find('.mapCommonsIcon').addClass('selected');

        return false;
    },
};


Metamaps.GlobalUI.Account = {
    isOpen: false,
    timeOut: null,
    changing: false,
    init: function () {
        var self = Metamaps.GlobalUI.Account;

        $(".sidebarAccount").hover(self.open, self.close);
    },
    open: function () {
        var self = Metamaps.GlobalUI.Account;

        clearTimeout(self.timeOut);
        if (!self.isOpen && !self.changing) {
            self.changing = true;
            $('.sidebarAccountBox').fadeIn(200, function () {
                self.changing = false;
                self.isOpen = true;
            });
        }
    },
    close: function () {
        var self = Metamaps.GlobalUI.Account;

        self.timeOut = setTimeout(function () {
            if (!self.changing) {
                self.changing = true;
                $('.sidebarAccountBox').fadeOut(200, function () {
                    self.changing = false;
                    self.isOpen = false;
                });
            }
        }, 500);
    }
};



Metamaps.GlobalUI.Search = {
    isOpen: false,
    timeOut: null,
    changing: false,
    optionsInitialized: false,
    init: function () {
        var self = Metamaps.GlobalUI.Search;

        // bind the hover events
        $(".sidebarSearch").hover(function () {
            self.open()
        }, function () {
            self.close(800, false)
        });

        $('.sidebarSearchIcon').click(function (e) {
            $('.sidebarSearchField').focus();
        });
        $('.sidebarSearch').click(function (e) {
            e.stopPropagation();
        });
        $('body').click(function (e) {
            self.close(0, false);
        });

        // open if the search is closed and user hits ctrl+/
        // close if they hit ESC
        $('body').bind('keydown', function (e) {
            switch (e.which) {
            case 191:
                if (e.ctrlKey && !self.isOpen) {
                    self.open();
                }
                break;
            case 27:
                if (self.isOpen) {
                    self.close(0, true);
                }
                break;
            default:
                break; //console.log(e.which);
            }
        });
        
        self.startTypeahead();
    },
    open: function () {
        var self = Metamaps.GlobalUI.Search;

        clearTimeout(self.timeOut);
        if (!self.isOpen && !self.changing) {
            self.changing = true;
            $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
                width: '200px'
            }, 200, function () {
                $('.sidebarSearchField, .sidebarSearch .tt-hint').css({
                    padding: '5px 10px',
                    width: '180px'
                });
                $('.sidebarSearchField').focus();
                self.changing = false;
                self.isOpen = true;
            });
        }
    },
    close: function (closeAfter, bypass) {
        var self = Metamaps.GlobalUI.Search;

        self.timeOut = setTimeout(function () {
            if (!self.changing && self.isOpen && (bypass || $('.sidebarSearchField').val() == '')) {
                self.changing = true;
                $('.sidebarSearchField, .sidebarSearch .tt-hint').css({
                    padding: '5px 0',
                    width: '200px'
                });
                $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
                    width: '0'
                }, 200, function () {
                    $('.sidebarSearchField').typeahead('setQuery', '');
                    $('.sidebarSearchField').blur();
                    self.changing = false;
                    self.isOpen = false;
                });
            }
        }, closeAfter);
    },
    startTypeahead: function () {
        var self = Metamaps.GlobalUI.Search;

        // TODO stop using userid
        var mapheader = userid ? '<h3 class="search-header">Maps</h3><input type="checkbox" class="limitToMe" id="limitMapsToMe"></input><label for="limitMapsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div>' : '<h3 class="search-header">Maps</h3><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div>';
        var topicheader = userid ? '<h3 class="search-header">Topics</h3><input type="checkbox" class="limitToMe" id="limitTopicsToMe"></input><label for="limitTopicsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div>' : '<h3 class="search-header">Topics</h3><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div>';
        var mapperheader = '<h3 class="search-header">Mappers</h3><div class="minimizeResults minimizeMapperResults"></div><div class="clearfloat"></div>';

        var topics = {
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
        };

        var maps = {
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
        };

        var mappers = {
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
            header: mapperheader
        };
        $('.sidebarSearchField').typeahead([topics, maps, mappers]);

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
        $('.sidebarSearchField').bind('typeahead:selected', self.handleResultClick);
        // don't do it, if they clicked on a 'addToMap' button
        $('.sidebarSearch button.addToMap').click(function (event) {
            event.stopPropagation();
        });

        // make sure that when you click on 'limit to me' or 'toggle section' it works
        $('.sidebarSearchField').bind('keyup', self.initSearchOptions);

    },
    handleResultClick: function (event, datum, dataset) {
        var self = Metamaps.GlobalUI.Search;

        if (datum.rtype != "noresult") {
            self.close(0, true);
            var win;
            if (dataset == "topics") {
                win = window.open('/topics/' + datum.id, '_blank');
            } else if (dataset == "maps") {
                win = window.open('/maps/' + datum.id, '_blank');
            } else if (dataset == "mappers") {
                win = window.open('/maps/mappers/' + datum.id, '_blank');
            }
            win.focus();
        }
    },
    initSearchOptions: function () {
        var self = Metamaps.GlobalUI.Search;

        function toggleResultSet(set) {
            var s = $('.tt-dataset-' + set + ' .tt-suggestions');
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
        }

        if (!self.optionsInitialized) {

            $('.limitToMe').bind("change", function (e) {
                // set the value of the search equal to itself to retrigger the autocomplete event
                self.isOpen = false;
                $('.sidebarSearchField').typeahead('setQuery', $('.sidebarSearchField').val());
                setTimeout(function () {
                    self.isOpen = true;
                }, 2000);
            });

            // when the user clicks minimize section, hide the results for that section
            $('.minimizeMapperResults').click(function (e) {
                toggleResultSet.call(this, 'mappers');
            });
            $('.minimizeTopicResults').click(function (e) {
                toggleResultSet.call(this, 'topics');
            });
            $('.minimizeMapResults').click(function (e) {
                toggleResultSet.call(this, 'maps');
            });

            self.optionsInitialized = true;
        }
    }
};
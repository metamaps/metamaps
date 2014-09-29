var Metamaps = {}; // this variable declaration defines a Javascript object that will contain all the variables and functions used by us, broken down into 'sub-modules' that look something like this
/*

* unless you are on a page with the Javascript InfoVis Toolkit (Topic or Map) the only section in the metamaps 
* object will be these
GlobalUI
Active
Maps
Mappers
Backbone

* all these get added when you are on a page with the Javascript Infovis Toolkit
Settings
Touch
Mouse
Selected
Metacodes
Topics
Synapses
Mappings
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
Map
Mapper
Topic
Synapse
JIT 
*/

Metamaps.Active = {
    Map: null,
    Topic: null,
    Mapper: null
};
Metamaps.Maps = {};

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

});

Metamaps.GlobalUI = {
    notifyTimeout: null,
    lightbox: null,
    init: function () {
        var self = Metamaps.GlobalUI;

        self.Search.init();
        self.CreateMap.init();
        self.Account.init();

        //bind lightbox clicks
        $('.openLightbox').click(function (event) {
            self.openLightbox($(this).attr('data-open'));
            event.preventDefault();
            return false;
        });
        
        $('#lightbox_screen, #lightbox_close').click(self.closeLightbox);
        
        // initialize global backbone models and collections
        if (Metamaps.Active.Mapper) Metamaps.Active.Mapper = new Metamaps.Backbone.Mapper(Metamaps.Active.Mapper);

        var myCollection = Metamaps.Maps.Mine ? Metamaps.Maps.Mine : [];
        var featuredCollection = Metamaps.Maps.Featured ? Metamaps.Maps.Featured : [];
        var activeCollection = Metamaps.Maps.Active ? Metamaps.Maps.Active : [];
        Metamaps.Maps.Mine = new Metamaps.Backbone.MapsCollection(myCollection, {id: 'mine', sortBy: 'name' });
        Metamaps.Maps.Featured = new Metamaps.Backbone.MapsCollection(featuredCollection, {id: 'featured', sortBy: 'name' });
        Metamaps.Maps.Active = new Metamaps.Backbone.MapsCollection(activeCollection, {id: 'active', sortBy: 'updated_at' });
    },
    openLightbox: function (which) {
        var self = Metamaps.GlobalUI;
        
        $('.lightboxContent').hide();
        $('#' + which).show();
        
        self.lightbox = which;

        $('#lightbox_overlay').show();
        
        var heightOfContent = '-' + ($('#lightbox_main').height() / 2) + 'px';
        // animate the content in from the bottom
        $('#lightbox_main').animate({
                'top': '50%',
                'margin-top': heightOfContent
        }, 200, 'easeOutCubic');
        
        // fade the black overlay in
        $('#lightbox_screen').animate({
                    'opacity': '0.42'
        }, 200);
        
        if (which == "switchMetacodes") {
            Metamaps.Create.isSwitchingSet = true;
        }
    },

    closeLightbox: function (event) {
        var self = Metamaps.GlobalUI;
        
        if (event) event.preventDefault();
        
        // animate the lightbox content offscreen
        $('#lightbox_main').animate({
                'top': '100%',
                'margin-top': '0'
        }, 200, 'easeInCubic');
        
        // fade the black overlay out
        $('#lightbox_screen').animate({
                    'opacity': '0.0'
        }, 200, function () {
            $('#lightbox_overlay').hide();   
        });
        
        if (self.lightbox === 'forkmap') Metamaps.GlobalUI.CreateMap.reset('fork_map');
        if (self.lightbox === 'newmap') Metamaps.GlobalUI.CreateMap.reset('new_map');
        if (Metamaps.Create && Metamaps.Create.isSwitchingSet) {
            Metamaps.Create.cancelMetacodeSetSwitch();
        }
        self.lightbox = null;
    },
    notifyUser: function (message, leaveOpen) {
        var self = Metamaps.GlobalUI;

        Metamaps.Famous.toast.surf.setContent(message);
        Metamaps.Famous.toast.show();
        clearTimeout(self.notifyTimeOut);
        if (!leaveOpen) {
            self.notifyTimeOut = setTimeout(function () {
                Metamaps.Famous.toast.hide();
            }, 8000);
        }
    },
    clearNotify: function() {
        var self = Metamaps.GlobalUI;

        clearTimeout(self.notifyTimeOut);
        Metamaps.Famous.toast.hide();
    }
};

Metamaps.GlobalUI.CreateMap = {
    newMap: null,
    emptyMapForm: "",
    emptyForkMapForm: "",
    topicsToMap: [],
    synapsesToMap: [],
    init: function () {
        var self = Metamaps.GlobalUI.CreateMap;

        self.newMap = new Metamaps.Backbone.Map({ permission: 'commons' });

        self.bindFormEvents();

        self.emptyMapForm = $('#new_map').html();

    },
    bindFormEvents: function () {
        var self = Metamaps.GlobalUI.CreateMap;
        
        $('.new_map button.cancel').unbind().bind('click', function (event) {
            event.preventDefault();
            Metamaps.GlobalUI.closeLightbox();
        });
        $('.new_map button.submitMap').unbind().bind('click', self.submit);
        
        // bind permission changer events on the createMap form
        $('.permIcon').unbind().bind('click', self.switchPermission);
    },
    generateSuccessMessage: function (id) {
        var stringStart = "Success! Do you want to <br> <a href='/maps/";
        stringStart += id;
        stringStart += "'>Go to your new map?</a>";
        stringStart += "<br>or<br><a href='#' onclick='Metamaps.GlobalUI.closeLightbox(); return false;'>Stay on this ";
        var page = Metamaps.Active.Map ? 'map' : 'page';
        var stringEnd = "?</a>";
        return stringStart + page + stringEnd;
    },
    switchPermission: function () {
        var self = Metamaps.GlobalUI.CreateMap;
        
        self.newMap.set('permission', $(this).attr('data-permission'));
        $(this).siblings('.permIcon').find('.mapPermIcon').removeClass('selected');
        $(this).find('.mapPermIcon').addClass('selected');
        
        var permText = $(this).find('.tip').html();
        $(this).parents('.new_map').find('.permText').html(permText);
    },
    submit: function (event) {
        event.preventDefault();
        
        var self = Metamaps.GlobalUI.CreateMap;

        if (Metamaps.GlobalUI.lightbox === 'forkmap') {
            self.newMap.set('topicsToMap', self.topicsToMap);
            self.newMap.set('synapsesToMap', self.synapsesToMap);
        }

        var formId = Metamaps.GlobalUI.lightbox === 'forkmap' ? '#fork_map' : '#new_map';
        var form = $(formId)

        self.newMap.set('name', form.find('#map_name').val());
        self.newMap.set('desc', form.find('#map_desc').val());

        // TODO validate map attributes
        if (self.newMap.get('name').length===0){
            console.log('Empty map name.');
            Metamaps.GlobalUI.notifyUser('map name is mandatory.');
            return;

        } else if (self.newMap.get('name').length>140){
            console.log('map name cannot exceed 140 characteres.');
            Metamaps.GlobalUI.notifyUser('map name cannot exceed 140 characteres.');
            return;
        }
        //console.log('self.newMap.get("name").length='+self.newMap.get("name").length.toString());

        self.newMap.save(null, {
            success: self.success
            // TODO add error message
        });
        
        if (Metamaps.GlobalUI.lightbox === 'forkmap') {
            form.html('Working...');
        }
    },
    success: function (model) {
        var self = Metamaps.GlobalUI.CreateMap;
        
        var formId = Metamaps.GlobalUI.lightbox === 'forkmap' ? '#fork_map' : '#new_map';
        var form = $(formId);
        
        form.html(self.generateSuccessMessage(model.id));
        
        $('#lightbox_main').css('margin-top', '-' + ($('#lightbox_main').height() / 2) + 'px');
    },
    reset: function (id) {
        var self = Metamaps.GlobalUI.CreateMap;

        var form = $('#' + id);
                
        if (id === "fork_map") {
            self.topicsToMap = [];
            self.synapsesToMap = [];
            form.html(self.emptyForkMapForm);
        }
        else {
            form.html(self.emptyMapForm);
        }
        
        self.bindFormEvents();
        self.newMap = new Metamaps.Backbone.Map({ permission: 'commons' });

        return false;
    },
};


Metamaps.GlobalUI.Account = {
    isOpen: false,
    changing: false,
    init: function () {
        var self = Metamaps.GlobalUI.Account;

        $('.sidebarAccountIcon').click(self.toggleBox);
        $('.sidebarAccountBox').click(function(event){ 
            event.stopPropagation();
        });
        $('body').click(self.close);
    },
    toggleBox: function (event) {
        var self = Metamaps.GlobalUI.Account;

        if (self.isOpen) self.close();
        else self.open();

        event.stopPropagation();
    },
    open: function () {
        var self = Metamaps.GlobalUI.Account;

        Metamaps.Realtime.close();
        Metamaps.Filter.close();

        if (!self.isOpen && !self.changing) {
            self.changing = true;
            $('.sidebarAccountBox').fadeIn(200, function () {
                self.changing = false;
                self.isOpen = true;
                $('.sidebarAccountBox #user_email').focus();
            });
        }
    },
    close: function () {
        var self = Metamaps.GlobalUI.Account;

        if (!self.changing) {
            self.changing = true;
            $('.sidebarAccountBox #user_email').blur();
            $('.sidebarAccountBox').fadeOut(200, function () {
                self.changing = false;
                self.isOpen = false;
            });
        }
    }
};



Metamaps.GlobalUI.Search = {
    locked: false,
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
                if ((e.ctrlKey && !self.isOpen) || (e.ctrlKey && self.locked)) {
                    self.open();
                }
                break;
            case 27:
                if (self.isOpen) {
                    self.close(0, true);
                }
                break;
            case 65:
            case 97:
                
                if (e.ctrlKey){
                    Metamaps.Control.deselectAllNodes();
                    Metamaps.Control.deselectAllEdges();

                    e.preventDefault();
                    Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                        Metamaps.Control.selectNode(n,e);
                    });

                    Metamaps.Visualize.mGraph.plot();
                }
                
                break;
            case 69:
            case 101:
                if (e.ctrlKey){
                    e.preventDefault();
                    Metamaps.JIT.zoomExtents();
                }
                break;
            default:
                break; //console.log(e.which);
            }
        });

        self.startTypeahead();
    },
    lock: function() {
        var self = Metamaps.GlobalUI.Search;
        self.locked = true;
    },
    unlock: function() {
        var self = Metamaps.GlobalUI.Search;
        self.locked = false;
    },
    open: function () {
        var self = Metamaps.GlobalUI.Search;

        clearTimeout(self.timeOut);
        if (!self.isOpen && !self.changing && !self.locked) {
            self.changing = true;
            $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
                width: '400px'
            }, 300, function () {
                $('.sidebarSearchField, .sidebarSearch .tt-hint').css({
                    padding: '7px 10px 3px 10px',
                    width: '380px'
                });
                $('.sidebarSearchField').focus();
                self.changing = false;
                self.isOpen = true;
            });
        }
        else if (self.locked) $('.sidebarSearchField').focus();
    },
    close: function (closeAfter, bypass) {
        var self = Metamaps.GlobalUI.Search;

        self.timeOut = setTimeout(function () {
            if (!self.locked && !self.changing && self.isOpen && (bypass || $('.sidebarSearchField').val() == '')) {
                self.changing = true;
                $('.sidebarSearchField, .sidebarSearch .tt-hint').css({
                    padding: '7px 0 3px 0',
                    width: '400px'
                });
                $('.sidebarSearch .twitter-typeahead, .sidebarSearch .tt-hint, .sidebarSearchField').animate({
                    width: '0'
                }, 300, function () {
                    $('.sidebarSearchField').typeahead('setQuery', '');
                    $('.sidebarSearchField').blur();
                    self.changing = false;
                    self.isOpen = false;
                });
            }
        }, closeAfter);
        
        if (self.locked) {
            $('.sidebarSearchField').typeahead('setQuery', '');
            $('.sidebarSearchField').blur();
        }
    },
    startTypeahead: function () {
        var self = Metamaps.GlobalUI.Search;

        var mapheader = Metamaps.Active.Mapper ? '<div class="searchTopicsHeader searchHeader"><h3 class="search-heading">Maps</h3><input type="checkbox" class="limitToMe" id="limitMapsToMe"></input><label for="limitMapsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div></div>' : '<div class="searchTopicsHeader searchHeader"><h3 class="search-heading">Maps</h3><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div></div>';
        var topicheader = Metamaps.Active.Mapper ? '<div class="searchMapsHeader searchHeader"><h3 class="search-heading">Topics</h3><input type="checkbox" class="limitToMe" id="limitTopicsToMe"></input><label for="limitTopicsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div></div>' : '<div class="searchMapsHeader searchHeader"><h3 class="search-heading">Topics</h3><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div></div>';
        var mapperheader = '<div class="searchMappersHeader searchHeader"><h3 class="search-heading">Mappers</h3><div class="minimizeResults minimizeMapperResults"></div><div class="clearfloat"></div></div>';

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
                    if (Metamaps.Active.Mapper && $("#limitTopicsToMe").is(':checked')) {
                        q += "&user=" + Metamaps.Active.Mapper.id.toString();
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
                    if (Metamaps.Active.Mapper && $("#limitMapsToMe").is(':checked')) {
                        q += "&user=" + Metamaps.Active.Mapper.id.toString();
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
                            profile: "/assets/user.png",
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
                Metamaps.Router.topics(datum.id);
            } else if (dataset == "maps") {
                Metamaps.Router.maps(datum.id);
            } else if (dataset == "mappers") {
                win = window.open('/maps/mappers/' + datum.id, '_blank');
                win.focus();
            }
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
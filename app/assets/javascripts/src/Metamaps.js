var labelType, useGradients, nativeTextSupport, animate;

(function () {
    var ua = navigator.userAgent,
        iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
        typeOfCanvas = typeof HTMLCanvasElement,
        nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
        textSupport = nativeCanvasSupport && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
    //I'm setting this based on the fact that ExCanvas provides text support for IE
    //and that as of today iPhone/iPad current text support is lame
    labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native' : 'HTML';
    nativeTextSupport = labelType == 'Native';
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);
})();

// TODO eliminate these 4 global variables
var panningInt; // this variable is used to store a 'setInterval' for the Metamaps.JIT.SmoothPanning() function, so that it can be cleared with window.clearInterval
var tempNode = null,
    tempInit = false,
    tempNode2 = null;

Metamaps.Settings = {
    embed: false, // indicates that the app is on a page that is optimized for embedding in iFrames on other web pages
    sandbox: false, // puts the app into a mode (when true) where it only creates data locally, and isn't writing it to the database
    colors: {
        background: '#344A58',
        synapses: {
            normal: '#222222',
            hover: '#222222',
            selected: '#FFFFFF'
        },
        topics: {
            selected: '#FFFFFF'
        },
        labels: {
            background: '#18202E',
            text: '#DDD'
        }
    }
};

Metamaps.Touch = {
    touchPos: null, // this stores the x and y values of a current touch event 
    touchDragNode: null // this stores a reference to a JIT node that is being dragged
};

Metamaps.Mouse = {
    didPan: false,
    didBoxZoom: false,
    changeInX: 0,
    changeInY: 0,
    edgeHoveringOver: false,
    boxStartCoordinates: false,
    boxEndCoordinates: false,
    synapseStartCoordinates: [],
    synapseEndCoordinates: null,
    lastNodeClick: 0,
    lastCanvasClick: 0,
    DOUBLE_CLICK_TOLERANCE: 300
};

Metamaps.Selected = {
    Nodes: [],
    Edges: []
};

/*
 *
 *   BACKBONE
 *
 */
Metamaps.Backbone.init = function () {
    var self = Metamaps.Backbone;

    self.Metacode = Backbone.Model.extend({
        initialize: function () {
            var image = new Image();
            image.src = this.get('icon');
            this.set('image',image);
        },
        prepareLiForFilter: function () {
            var li = '';
            li += '<li data-id="' + this.id.toString() + '">';      
            li += '<img src="' + this.get('icon') + '" data-id="' + this.id.toString() + '"';
            li += ' alt="' + this.get('name') + '" />';      
            li += '<p>' + this.get('name').toLowerCase() + '</p></li>';
            return li;
        }

    });
    self.MetacodeCollection = Backbone.Collection.extend({
        model: this.Metacode,
        url: '/metacodes',
        comparator: function (a, b) {
            a = a.get('name').toLowerCase();
            b = b.get('name').toLowerCase();
            return a > b ? 1 : a < b ? -1 : 0;
        }
    });

    self.Topic = Backbone.Model.extend({
        urlRoot: '/topics',
        blacklist: ['node', 'created_at', 'updated_at', 'user_name', 'user_image', 'map_count', 'synapse_count'],
        toJSON: function (options) {
            return _.omit(this.attributes, this.blacklist);
        },
        initialize: function () {
            if (this.isNew()) {
                this.set({
                    "user_id": Metamaps.Active.Mapper.id,
                    "desc": '',
                    "link": '',
                    "permission": Metamaps.Active.Map ? Metamaps.Active.Map.get('permission') : 'commons'
                });
            }
            
            this.on('change:metacode_id', Metamaps.Filter.checkMetacodes, this);

            var updateName = function () {
                if (this.get('node')) this.get('node').name = this.get('name');
                if (Metamaps.Visualize) Metamaps.Visualize.mGraph.plot();
            };
            this.on('change:name', updateName, this);
        },
        authorizeToEdit: function (mapper) {
            if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
            else return false;
        },
        authorizePermissionChange: function (mapper) {
            if (mapper && this.get('user_id') === mapper.get('id')) return true;
            else return false;
        },
        getDate: function () {

        },
        getMetacode: function () {
            return Metamaps.Metacodes.get(this.get('metacode_id'));
        },
        getMapping: function () {
            
            if (!Metamaps.Active.Map) return false;
            
            return Metamaps.Mappings.findWhere({
                map_id: Metamaps.Active.Map.id,
                topic_id: this.isNew() ? this.cid : this.id
            });
        },
        createNode: function () {
            var mapping;
            var node = {
                adjacencies: [],
                id: this.isNew() ? this.cid : this.id,
                name: this.get('name')
            };
            
            if (Metamaps.Active.Map) {
                mapping = this.getMapping();
                node.data = {
                    $mapping: null,
                    $mappingID: mapping.id
                };
            }
            
            return node;
        },
        updateNode: function () {
            var mapping;
            var node = this.get('node');
            node.setData('topic', this);
            node.id = this.isNew() ? this.cid : this.id;
            
            if (Metamaps.Active.Map) {
                mapping = this.getMapping();
                node.setData('mapping', mapping);
            }
            
            return node;
        },
    });

    self.TopicCollection = Backbone.Collection.extend({
        model: self.Topic,
        url: '/topics'
    });

    self.Synapse = Backbone.Model.extend({
        urlRoot: '/synapses',
        blacklist: ['edge', 'created_at', 'updated_at'],
        toJSON: function (options) {
            return _.omit(this.attributes, this.blacklist);
        },
        initialize: function () {
            if (this.isNew()) {
                this.set({
                    "user_id": Metamaps.Active.Mapper.id,
                    "permission": Metamaps.Active.Map ? Metamaps.Active.Map.get('permission') : 'commons',
                    "category": "from-to"
                });
            }
            this.on('change:desc', Metamaps.Filter.checkSynapses, this);
        },
        prepareLiForFilter: function () {
            var li = '';
            li += '<li data-id="' + this.get('desc') + '">';      
            li += '<img src="/assets/synapse16.png"';
            li += ' alt="synapse icon" />';      
            li += '<p>' + this.get('desc') + '</p></li>';
            return li;
        },
        authorizeToEdit: function (mapper) {
            if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
            else return false;
        },
        authorizePermissionChange: function (mapper) {
            if (mapper && this.get('user_id') === mapper.get('id')) return true;
            else return false;
        },
        getTopic1: function () {
            return Metamaps.Topic.get(this.get('node1_id'));
        },
        getTopic2: function () {
            return Metamaps.Topic.get(this.get('node2_id'));
        },
        getDirection: function () {
            return [
                    this.get('node1_id'),
                    this.get('node2_id')
                ];
        },
        getMapping: function () {
            
            if (!Metamaps.Active.Map) return false;
            
            return Metamaps.Mappings.findWhere({
                map_id: Metamaps.Active.Map.id,
                synapse_id: this.isNew() ? this.cid : this.id
            });
        },
        createEdge: function () {
            var mapping, mappingID;
            var synapseID = this.isNew() ? this.cid : this.id;

            var edge = {
                nodeFrom: this.get('node1_id'),
                nodeTo: this.get('node2_id'),
                data: {
                    $synapses: [],
                    $synapseIDs: [synapseID],
                }
            };
            
            if (Metamaps.Active.Map) {
                mapping = this.getMapping();
                mappingID = mapping.isNew() ? mapping.cid : mapping.id;
                edge.data.$mappings = [];
                edge.data.$mappingIDs = [mappingID];
            }
            
            return edge;
        },
        updateEdge: function () {
            var mapping;
            var edge = this.get('edge');
            edge.getData('synapses').push(this);
            
            if (Metamaps.Active.Map) {
                mapping = this.getMapping();
                edge.getData('mappings').push(mapping);
            }
            
            return edge;
        },
    });

    self.SynapseCollection = Backbone.Collection.extend({
        model: self.Synapse,
        url: '/synapses'
    });

    self.Mapping = Backbone.Model.extend({
        urlRoot: '/mappings',
        blacklist: ['created_at', 'updated_at'],
        toJSON: function (options) {
            return _.omit(this.attributes, this.blacklist);
        },
        initialize: function () {
            if (this.isNew()) {
                this.set({
                    "user_id": Metamaps.Active.Mapper.id,
                    "map_id": Metamaps.Active.Map ? Metamaps.Active.Map.id : null
                });
            }
        },
        getMap: function () {
            return Metamaps.Map.get(this.get('map_id'));
        },
        getTopic: function () {
            if (this.get('category') === 'Topic') return Metamaps.Topic.get(this.get('topic_id'));
            else return false;
        },
        getSynapse: function () {
            if (this.get('category') === 'Synapse') return Metamaps.Synapse.get(this.get('synapse_id'));
            else return false;
        }
    });

    self.MappingCollection = Backbone.Collection.extend({
        model: self.Mapping,
        url: '/mappings'
    });

    Metamaps.Metacodes = Metamaps.Metacodes ? new self.MetacodeCollection(Metamaps.Metacodes) : new self.MetacodeCollection();

    Metamaps.Topics = Metamaps.Topics ? new self.TopicCollection(Metamaps.Topics) : new self.TopicCollection();

    Metamaps.Synapses = Metamaps.Synapses ? new self.SynapseCollection(Metamaps.Synapses) : new self.SynapseCollection();

    Metamaps.Mappers = Metamaps.Mappers ? new self.MapperCollection(Metamaps.Mappers) : new self.MapperCollection();

    if (Metamaps.Active.Map) {
        Metamaps.Mappings = Metamaps.Mappings ? new self.MappingCollection(Metamaps.Mappings) : new self.MappingCollection();

        Metamaps.Active.Map = new self.Map(Metamaps.Active.Map);
    }
    
    if (Metamaps.Active.Topic) Metamaps.Active.Topic = new self.Topic(Metamaps.Active.Topic);

    //attach collection event listeners
    self.attachCollectionEvents = function () {
        
        Metamaps.Topics.on("add remove", function(topic){
            Metamaps.Map.InfoBox.updateNumbers();
            Metamaps.Filter.checkMetacodes();
            Metamaps.Filter.checkMappers();
        });

        Metamaps.Synapses.on("add remove", function(synapse){
            Metamaps.Map.InfoBox.updateNumbers();
            Metamaps.Filter.checkSynapses();
            Metamaps.Filter.checkMappers();
        });
        
        if (Metamaps.Active.Map) {
            Metamaps.Mappings.on("add remove", function(mapping){
                Metamaps.Map.InfoBox.updateNumbers();
                Metamaps.Filter.checkSynapses();
                Metamaps.Filter.checkMetacodes();
                Metamaps.Filter.checkMappers();
            });
        }
    }
    self.attachCollectionEvents();
}; // end Metamaps.Backbone.init


/*
 *
 *   CREATE
 *
 */
Metamaps.Create = {
    isSwitchingSet: false, // indicates whether the metacode set switch lightbox is open
    selectedMetacodeSet: null,
    selectedMetacodeSetIndex: null,
    selectedMetacodeNames: [],
    newSelectedMetacodeNames: [],
    selectedMetacodes: [],
    newSelectedMetacodes: [],
    init: function () {
        var self = Metamaps.Create;
        self.newTopic.init();
        self.newSynapse.init();

        //////
        //////
        //// SWITCHING METACODE SETS

        $('#metacodeSwitchTabs').tabs({
            selected: self.selectedMetacodeSetIndex
        }).addClass("ui-tabs-vertical ui-helper-clearfix");
        $("#metacodeSwitchTabs .ui-tabs-nav li").removeClass("ui-corner-top").addClass("ui-corner-left");
        $('.customMetacodeList li').click(self.toggleMetacodeSelected); // within the custom metacode set tab
    },
    toggleMetacodeSelected: function () {
        var self = Metamaps.Create;

        if ($(this).attr('class') != 'toggledOff') {
            $(this).addClass('toggledOff');
            var value_to_remove = $(this).attr('id');
            var name_to_remove = $(this).attr('data-name');
            self.newSelectedMetacodes.splice(self.newSelectedMetacodes.indexOf(value_to_remove), 1);
            self.newSelectedMetacodeNames.splice(self.newSelectedMetacodeNames.indexOf(name_to_remove), 1);
        } else if ($(this).attr('class') == 'toggledOff') {
            $(this).removeClass('toggledOff');
            self.newSelectedMetacodes.push($(this).attr('id'));
            self.newSelectedMetacodeNames.push($(this).attr('data-name'));
        }
    },
    updateMetacodeSet: function (set, index, custom) {

        if (custom && Metamaps.Create.newSelectedMetacodes.length == 0) {
            alert('Please select at least one metacode to use!');
            return false;
        }

        var codesToSwitchTo;
        Metamaps.Create.selectedMetacodeSetIndex = index;
        Metamaps.Create.selectedMetacodeSet = "metacodeset-" + set;

        if (!custom) {
            codesToSwitchTo = $('#metacodeSwitchTabs' + set).attr('data-metacodes').split(',');
            $('.customMetacodeList li').addClass('toggledOff');
            Metamaps.Create.selectedMetacodes = [];
            Metamaps.Create.selectedMetacodeNames = [];
            Metamaps.Create.newSelectedMetacodes = [];
            Metamaps.Create.newSelectedMetacodeNames = [];
        }
        if (custom) {
            // uses .slice to avoid setting the two arrays to the same actual array
            Metamaps.Create.selectedMetacodes = Metamaps.Create.newSelectedMetacodes.slice(0);
            Metamaps.Create.selectedMetacodeNames = Metamaps.Create.newSelectedMetacodeNames.slice(0);
            codesToSwitchTo = Metamaps.Create.selectedMetacodeNames.slice(0);
        }

        // sort by name
        codesToSwitchTo.sort();
        codesToSwitchTo.reverse();

        $('#metacodeImg, #metacodeImgTitle').empty();
        $('#metacodeImg').removeData('cloudcarousel');
        var newMetacodes = "";
        var metacode;
        for (var i = 0; i < codesToSwitchTo.length; i++) {
            metacode = Metamaps.Metacodes.findWhere({ name: codesToSwitchTo[i] });
            newMetacodes += '<img class="cloudcarousel" width="40" height="40" src="' + metacode.get('icon') + '" title="' + metacode.get('name') + '" alt="' + metacode.get('name') + '"/>';
        };
        $('#metacodeImg').empty().append(newMetacodes).CloudCarousel({
            titleBox: $('#metacodeImgTitle'),
            yRadius: 40,
            xRadius: 190,
            xPos: 170,
            yPos: 40,
            speed: 0.3,
            mouseWheel: true,
            bringToFront: true
        });

        Metamaps.GlobalUI.closeLightbox();
        $('#topic_name').focus();

        var mdata = {
            "metacodes": {
                "value": custom ? Metamaps.Create.selectedMetacodes.toString() : Metamaps.Create.selectedMetacodeSet
            }
        };
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "/user/updatemetacodes",
            data: mdata,
            success: function (data) {
                console.log('selected metacodes saved');
            },
            error: function () {
                console.log('failed to save selected metacodes');
            }
        });
    },

    cancelMetacodeSetSwitch: function () {
        var self = Metamaps.Create;
        self.isSwitchingSet = false;

        if (self.selectedMetacodeSet != "metacodeset-custom") {
            $('.customMetacodeList li').addClass('toggledOff');
            self.selectedMetacodes = [];
            self.selectedMetacodeNames = [];
            self.newSelectedMetacodes = [];
            self.newSelectedMetacodeNames = [];
        } else { // custom set is selected
            // reset it to the current actual selection
            $('.customMetacodeList li').addClass('toggledOff');
            for (var i = 0; i < self.selectedMetacodes.length; i++) {
                $('#' + self.selectedMetacodes[i]).removeClass('toggledOff');
            };
            // uses .slice to avoid setting the two arrays to the same actual array
            self.newSelectedMetacodeNames = self.selectedMetacodeNames.slice(0);
            self.newSelectedMetacodes = self.selectedMetacodes.slice(0);
        }
        $('#metacodeSwitchTabs').tabs("select", self.selectedMetacodeSetIndex);
        $('#topic_name').focus();
    },
    newTopic: {
        init: function () {
            
            $('#topic_name').keyup(function () {
                Metamaps.Create.newTopic.name = $(this).val();
            });

            // initialize the autocomplete results for the metacode spinner
            $('#topic_name').typeahead([
                {
                    name: 'topic_autocomplete',
                    limit: 8,
                    template: $('#topicAutocompleteTemplate').html(),
                    remote: {
                        url: '/topics/autocomplete_topic?term=%QUERY'
                    },
                    engine: Hogan
                  }
            ]);

            // tell the autocomplete to submit the form with the topic you clicked on if you pick from the autocomplete
            $('#topic_name').bind('typeahead:selected', function (event, datum, dataset) {
                Metamaps.Topic.getTopicFromAutocomplete(datum.id);
            });

            // initialize metacode spinner and then hide it
            $("#metacodeImg").CloudCarousel({
                titleBox: $('#metacodeImgTitle'),
                yRadius: 40,
                xRadius: 190,
                xPos: 170,
                yPos: 40,
                speed: 0.3,
                mouseWheel: true,
                bringToFront: true
            });
            $('.new_topic').hide();
        },
        name: null,
        newId: 1,
        beingCreated: false,
        metacode: null,
        x: null,
        y: null,
        addSynapse: false,
        open: function () {
            $('#new_topic').fadeIn('fast', function () {
                $('#topic_name').focus();
            });
            Metamaps.Create.newTopic.beingCreated = true;
        },
        hide: function () {
            $('#new_topic').fadeOut('fast');
            $("#topic_name").typeahead('setQuery', '');
            Metamaps.Create.newTopic.beingCreated = false;
        }
    },
    newSynapse: {
        init: function () {
            var self = Metamaps.Create.newSynapse;

            $('#synapse_desc').keyup(function () {
                Metamaps.Create.newSynapse.description = $(this).val();
            });

            // initialize the autocomplete results for synapse creation
            $('#synapse_desc').typeahead([
                {
                    name: 'synapse_autocomplete',
                    template: "<div class='genericSynapseDesc'>{{label}}</div>",
                    remote: {
                        url: '/search/synapses?term=%QUERY'
                    },
                    engine: Hogan
                },
                {
                    name: 'existing_synapses',
                    limit: 50,
                    template: $('#synapseAutocompleteTemplate').html(),
                    remote: {
                        url: '/search/synapses',
                        replace: function () {
                            return self.getSearchQuery();
                        }
                    },
                    engine: Hogan,
                    header: "<h3>Existing Synapses</h3>"
                }
          ]);

            $('#synapse_desc').bind('typeahead:selected', function (event, datum, dataset) {
                if (datum.id) { // if they clicked on an existing synapse get it
                    Metamaps.Synapse.getSynapseFromAutocomplete(datum.id);
                }
            });
        },
        beingCreated: false,
        description: null,
        topic1id: null,
        topic2id: null,
        newSynapseId: null,
        open: function () {
            $('#new_synapse').fadeIn('fast', function () {
                $('#synapse_desc').focus();
            });
            Metamaps.Create.newSynapse.beingCreated = true;
        },
        hide: function () {
            $('#new_synapse').fadeOut('fast');
            $("#synapse_desc").typeahead('setQuery', '');
            Metamaps.Create.newSynapse.beingCreated = false;
            Metamaps.Create.newTopic.addSynapse = false;
            Metamaps.Create.newSynapse.topic1id = 0;
            Metamaps.Create.newSynapse.topic2id = 0;
            Metamaps.Mouse.synapseStartCoordinates = [];
            Metamaps.Visualize.mGraph.plot();
        },
        getSearchQuery: function () {
            var self = Metamaps.Create.newSynapse;

            if (Metamaps.Selected.Nodes.length < 2) {
                return '/search/synapses?topic1id=' + self.topic1id + '&topic2id=' + self.topic2id;
            } else return '';
        }
    }
}; // end Metamaps.Create


////////////////// TOPIC AND SYNAPSE CARDS //////////////////////////


/*
 *
 *   TOPICCARD
 *
 */
Metamaps.TopicCard = {
    openTopicCard: null, //stores the topic that's currently open
    authorizedToEdit: false, // stores boolean for edit permission for open topic card
    init: function () {
        var self = Metamaps.TopicCard;

        // initialize best_in_place editing
        $('.authenticated div.permission.canEdit .best_in_place').best_in_place();

        Metamaps.TopicCard.generateShowcardHTML = Hogan.compile($('#topicCardTemplate').html());

        // initialize topic card draggability and resizability
        $('.showcard').draggable({
            handle: ".metacodeImage"
        });

        embedly('on', 'card.rendered', self.embedlyCardRendered);
    },
    /**
     * Will open the Topic Card for the node that it's passed
     * @param {$jit.Graph.Node} node
     */
    showCard: function (node) {
        var self = Metamaps.TopicCard;

        var topic = node.getData('topic');

        self.openTopicCard = topic;
        self.authorizedToEdit = topic.authorizeToEdit(Metamaps.Active.Mapper);
        //populate the card that's about to show with the right topics data
        self.populateShowCard(topic);
        $('.showcard').fadeIn('fast');
    },
    hideCard: function () {
        var self = Metamaps.TopicCard;

        $('.showcard').fadeOut('fast');
        self.openTopicCard = null;
        self.authorizedToEdit = false;
    },
    embedlyCardRendered: function (iframe) {
        var self = Metamaps.TopicCard;

        $('#embedlyLinkLoader').hide();
        $('#embedlyLink').fadeIn('fast');
        if (self.authorizedToEdit) {
            $('.embeds').append('<div id="linkremove"></div>');
            $('#linkremove').click(self.removeLink);
        }
    },
    removeLink: function () {
        var self = Metamaps.TopicCard;
        self.openTopicCard.save({
            link: null
        });
        $('.embeds').empty();
        $('.attachments').removeClass('hidden');
        $('.addAttachment').show();
        $('.CardOnGraph').removeClass('hasAttachment');
    },
    bindShowCardListeners: function (topic) {
        var self = Metamaps.TopicCard;
        var showCard = document.getElementById('showcard');

        var authorized = self.authorizedToEdit;

        // get mapper image
        var setMapperImage = function (mapper) {
            $('.contributorIcon').attr('src', mapper.get('image'));
        };
        Metamaps.Mapper.get(topic.get('user_id'), setMapperImage)

        // starting embed.ly
        var addLinkFunc = function () {
            var addLinkDiv ='';
            var addLinkDesc ='Enter or paste a link';
            addLinkDiv+='<div class="addLink"><div id="addLinkIcon"></div>';
            addLinkDiv+='<div id="addLinkInput"><input placeholder="' + addLinkDesc + '"></input>';
            addLinkDiv+='<div id="addLinkReset"></div></div></div>';
            $('.addAttachment').hide();
            $('.attachments').append(addLinkDiv);
            $('.showcard #addLinkReset').click(resetFunc);
            $('.showcard #addLinkInput input').bind("paste keyup",inputEmbedFunc);
            $('#addLinkInput input').focus();
        };
        var resetFunc = function () {
            $('.addLink').remove();
            $('.addAttachment').show();
        };
        var inputEmbedFunc = function (event) {
            
            var element = this;
            setTimeout(function () {
                var text = $(element).val();
                if (event.type=="paste" || (event.type=="keyup" && event.which==13)){
                    if (text.slice(0, 4) !== 'http') {
                        text='http://'+text;
                    }
                    topic.save({
                        link: text
                    });
                    var embedlyEl = $('<a/>', {
                        id: 'embedlyLink',
                        'data-card-chrome': '0',
                        'data-card-description': '0',
                        href: text
                    }).html(text);
                    $('.addLink').remove();
                    $('.attachments').addClass('hidden');
                    $('.embeds').append(embedlyEl);
                    $('.embeds').append('<div id="embedlyLinkLoader"></div>');
                    var loader = new CanvasLoader('embedlyLinkLoader');
                    loader.setColor('#4fb5c0'); // default is '#000000'
                    loader.setDiameter(28); // default is 40
                    loader.setDensity(41); // default is 40
                    loader.setRange(0.9); // default is 1.3
                    loader.show(); // Hidden by default
                    embedly('card', document.getElementById('embedlyLink'));
                    $('.CardOnGraph').addClass('hasAttachment');
                }
            }, 100);
        };

        // initialize the link card, if there is a link
        if (topic.get('link') && topic.get('link') !== '') {
            var loader = new CanvasLoader('embedlyLinkLoader');
            loader.setColor('#4fb5c0'); // default is '#000000'
            loader.setDiameter(28); // default is 40
            loader.setDensity(41); // default is 40
            loader.setRange(0.9); // default is 1.3
            loader.show(); // Hidden by default
            embedly('card', document.getElementById('embedlyLink'));
        }
        $('.showcard #addlink').click(addLinkFunc);


        var selectingMetacode = false;
        // attach the listener that shows the metacode title when you hover over the image
        $('.showcard .metacodeImage').mouseenter(function () {
            $('.showcard .icon').css('z-index', '4');
            $('.showcard .metacodeTitle').show();
        });
        $('.showcard .linkItem.icon').mouseleave(function () {
            if (!selectingMetacode) {
                $('.showcard .metacodeTitle').hide();
                $('.showcard .icon').css('z-index', '1');
            }
        });

        var metacodeLiClick = function () {
            selectingMetacode = false;
            var metacodeName = $(this).find('.mSelectName').text();
            var metacode = Metamaps.Metacodes.findWhere({
                name: metacodeName
            });
            $('.CardOnGraph').find('.metacodeTitle').html(metacodeName)
                .append('<div class="expandMetacodeSelect"></div>')
                .attr('class', 'metacodeTitle mbg' + metacodeName.replace(/\s/g, ''));
            $('.CardOnGraph').find('.metacodeImage').css('background-image', 'url(' + metacode.get('icon') + ')');
            topic.save({
                metacode_id: metacode.id
            });
            Metamaps.Visualize.mGraph.plot();
            $('.metacodeSelect').hide();
            $('.metacodeTitle').hide();
            $('.showcard .icon').css('z-index', '1');
        };

        var openMetacodeSelect = function (event) {
            if (!selectingMetacode) {
                selectingMetacode = true;
                $('.metacodeSelect').show();
                event.stopPropagation();
            }
        };

        var hideMetacodeSelect = function () {
            selectingMetacode = false;
            $('.metacodeSelect').hide();
            $('.metacodeTitle').hide();
            $('.showcard .icon').css('z-index', '1');
        };

        if (authorized) {
            $('.showcard .metacodeTitle').click(openMetacodeSelect);
            $('.showcard').click(hideMetacodeSelect);
            $('.metacodeSelect > ul li').click(function (event){
                event.stopPropagation();
            });
            $('.metacodeSelect li li').click(metacodeLiClick);

            var bipName = $(showCard).find('.best_in_place_name');
            bipName.best_in_place();
            bipName.bind("best_in_place:activate", function () {
                var $el = bipName.find('textarea');
                var el = $el[0];

                $el.attr('maxlength', '140');

                $('.showcard .title').append('<div class="titleCounter"></div>');

                var callback = function (data) {
                    $('.titleCounter').html(data.all + '/140');
                };
                Countable.live(el, callback);
            });
            bipName.bind("best_in_place:deactivate", function () {
                $('.titleCounter').remove();
            });

            //bind best_in_place ajax callbacks
            bipName.bind("ajax:success", function () {
                var name = Metamaps.Util.decodeEntities($(this).html());
                topic.set("name", name);
            });

            $(showCard).find('.best_in_place_desc').bind("ajax:success", function () {
                this.innerHTML = this.innerHTML.replace(/\r/g, '')
                var desc = $(this).html();
                topic.set("desc", desc);
            });
        }

        // ability to change permission
        var selectingPermission = false;
        if (topic.authorizePermissionChange(Metamaps.Active.Mapper)) {
            $('.showcard .yourTopic .mapPerm').click(function () {
                if (!selectingPermission) {
                    selectingPermission = true;
                    $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
                    if ($(this).hasClass('co')) {
                        $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>');
                    } else if ($(this).hasClass('pu')) {
                        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>');
                    } else if ($(this).hasClass('pr')) {
                        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>');
                    }
                    $('.permissionSelect li').click(function (event) {
                        selectingPermission = false;
                        var permission = $(this).attr('class');
                        topic.save({
                            permission: permission
                        });
                        $('.showcard .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2));
                        $('.permissionSelect').remove();
                        event.stopPropagation();
                    });
                } else {
                    selectingPermission = false;
                    $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
                    $('.permissionSelect').remove();
                }
            });
        }
    },
    populateShowCard: function (topic) {
        var self = Metamaps.TopicCard;

        var showCard = document.getElementById('showcard');

        $(showCard).find('.permission').remove();

        var topicForTemplate = self.buildObject(topic);
        var html = self.generateShowcardHTML.render(topicForTemplate);

        if (topic.authorizeToEdit(Metamaps.Active.Mapper)) {
            var perm = document.createElement('div');

            var string = 'permission canEdit';
            if (topic.authorizePermissionChange(Metamaps.Active.Mapper)) string += ' yourTopic';
            perm.className = string;
            perm.innerHTML = html;
            showCard.appendChild(perm);
        } else {
            var perm = document.createElement('div');
            perm.className = 'permission cannotEdit';
            perm.innerHTML = html;
            showCard.appendChild(perm);
        }

        Metamaps.TopicCard.bindShowCardListeners(topic);
    },
    generateShowcardHTML: null, // will be initialized into a Hogan template within init function
    //generateShowcardHTML
    buildObject: function (topic) {
        var self=Metamaps.TopicCard;

        var nodeValues = {};
        
        var authorized = topic.authorizeToEdit(Metamaps.Active.Mapper);

        if (!authorized) {
            
        } else {
            
        }

        var desc_nil = "Click to add description...";

        nodeValues.attachmentsHidden = '';
        if (topic.get('link') && topic.get('link')!== '') {
            nodeValues.embeds = '<a href="' + topic.get('link') + '" id="embedlyLink" target="_blank" data-card-chrome="0" data-card-description="0">';
            nodeValues.embeds += topic.get('link');
            nodeValues.embeds += '</a><div id="embedlyLinkLoader"></div>';
            nodeValues.attachmentsHidden = 'hidden';
            nodeValues.hasAttachment = "hasAttachment";
        }
        else {
            nodeValues.embeds = '';
            nodeValues.hasAttachment = '';
        }

        if (authorized) {
            nodeValues.attachments = '<div class="addAttachment">';
            nodeValues.attachments += '<div id="addlink"><div id="linkIcon" class="attachmentIcon"></div>Attach a link</div>';
            nodeValues.attachments += '<div id="addupload"><div id="uploadIcon" class="attachmentIcon"></div>Upload a file</div></div>';
        } else {
            nodeValues.attachmentsHidden = 'hidden';
            nodeValues.attachments = '';
        }

        nodeValues.permission = topic.get("permission");
        nodeValues.mk_permission = topic.get("permission").substring(0, 2);
        nodeValues.map_count = topic.get("map_count").toString();
        nodeValues.synapse_count = topic.get("synapse_count").toString();
        nodeValues.id = topic.isNew() ? topic.cid : topic.id;
        nodeValues.metacode = topic.getMetacode().get("name");
        nodeValues.metacode_class = 'mbg' + topic.getMetacode().get("name").replace(/\s/g, '');
        nodeValues.imgsrc = topic.getMetacode().get("icon");
        nodeValues.name = topic.get("name");
        nodeValues.userid = topic.get("user_id");
        nodeValues.username = topic.get("user_name");
        nodeValues.date = topic.getDate();
        // the code for this is stored in /views/main/_metacodeOptions.html.erb
        nodeValues.metacode_select = $('#metacodeOptions').html();
        nodeValues.desc_nil = desc_nil;
        nodeValues.desc = (topic.get("desc") == "" && authorized) ? desc_nil : topic.get("desc");
        return nodeValues;
    }
}; // end Metamaps.TopicCard


/*
 *
 *   SYNAPSECARD
 *
 */
Metamaps.SynapseCard = {
    openSynapseCard: null,
    showCard: function (edge, e) {
        var self = Metamaps.SynapseCard;

        //reset so we don't interfere with other edges, but first, save its x and y 
        var myX = $('#edit_synapse').css('left');
        var myY = $('#edit_synapse').css('top');
        $('#edit_synapse').remove();

        //so label is missing while editing
        Metamaps.Control.deselectEdge(edge);

        var synapse = edge.getData('synapses')[0]; // for now, just get the first synapse

        //create the wrapper around the form elements, including permissions
        //classes to make best_in_place happy
        var edit_div = document.createElement('div');
        edit_div.setAttribute('id', 'edit_synapse');
        if (synapse.authorizeToEdit(Metamaps.Active.Mapper)) {
            edit_div.className = 'permission canEdit';
            edit_div.className += synapse.authorizePermissionChange(Metamaps.Active.Mapper) ? ' yourEdge' : '';
        } else {
            edit_div.className = 'permission cannotEdit';
        }
        $('.main .wrapper').append(edit_div);

        self.populateShowCard(synapse);

        //drop it in the right spot, activate it
        $('#edit_synapse').css('position', 'absolute');
        if (e) {
            $('#edit_synapse').css('left', e.clientX);
            $('#edit_synapse').css('top', e.clientY);
        } else {
            $('#edit_synapse').css('left', myX);
            $('#edit_synapse').css('top', myY);
        }
        //$('#edit_synapse_name').click(); //required in case name is empty
        //$('#edit_synapse_name input').focus();
        $('#edit_synapse').show();

        self.openSynapseCard = synapse.isNew() ? synapse.cid : synapse.id;
    },

    hideCard: function () {
        $('#edit_synapse').remove();
        Metamaps.SynapseCard.openSynapseCard = null;
    },

    populateShowCard: function (synapse) {
        var self = Metamaps.SynapseCard;

        self.add_name_form(synapse);
        self.add_user_info(synapse);
        self.add_perms_form(synapse);
        if (synapse.authorizeToEdit(Metamaps.Active.Mapper)) {
            self.add_direction_form(synapse);
        }
    },

    add_name_form: function (synapse) {
        var data_nil = 'Click to add description.';

        // TODO make it so that this would work even in sandbox mode,
        // currently with Best_in_place it won't

        //name editing form
        $('#edit_synapse').append('<div id="edit_synapse_name"></div>');
        $('#edit_synapse_name').attr('class', 'best_in_place best_in_place_desc');
        $('#edit_synapse_name').attr('data-object', 'synapse');
        $('#edit_synapse_name').attr('data-attribute', 'desc');
        $('#edit_synapse_name').attr('data-type', 'textarea');
        $('#edit_synapse_name').attr('data-nil', data_nil);
        $('#edit_synapse_name').attr('data-url', '/synapses/' + synapse.id);
        $('#edit_synapse_name').html(synapse.get("desc"));

        //if edge data is blank or just whitespace, populate it with data_nil
        if ($('#edit_synapse_name').html().trim() == '') {
            $('#edit_synapse_name').html(data_nil);
        }

        $('#edit_synapse_name').bind("ajax:success", function () {
            var desc = $(this).html();
            if (desc == data_nil) {
                synapse.set("desc", '');
            } else {
                synapse.set("desc", desc);
            }
            Metamaps.Control.selectEdge(synapse.get('edge'));
            Metamaps.Visualize.mGraph.plot();
        });
    },

    add_user_info: function (synapse) {
        var u = '<div id="edgeUser" class="hoverForTip">';
        u += '<div class="tip">Created by ' + synapse.get("user_name") + '</div></div>';
        $('#edit_synapse').append(u);
    },

    add_perms_form: function (synapse) {
        //permissions - if owner, also allow permission editing
        $('#edit_synapse').append('<div class="mapPerm ' + synapse.get("permission").substring(0, 2) + '"></div>');

        // ability to change permission
        var selectingPermission = false;
        if (synapse.authorizePermissionChange(Metamaps.Active.Mapper)) {
            $('#edit_synapse.yourEdge .mapPerm').click(function () {
                if (!selectingPermission) {
                    selectingPermission = true;
                    $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
                    if ($(this).hasClass('co')) {
                        $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>');
                    } else if ($(this).hasClass('pu')) {
                        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>');
                    } else if ($(this).hasClass('pr')) {
                        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>');
                    }
                    $('#edit_synapse .permissionSelect li').click(function (event) {
                        selectingPermission = false;
                        var permission = $(this).attr('class');
                        synapse.save({
                            permission: permission,
                        });
                        $('#edit_synapse .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2));
                        $('#edit_synapse .permissionSelect').remove();
                        event.stopPropagation();
                    });
                } else {
                    selectingPermission = false;
                    $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
                    $('#edit_synapse .permissionSelect').remove();
                }
            });
        }
    }, //add_perms_form

    add_direction_form: function (synapse) {
        //directionality checkboxes
        $('#edit_synapse').append('<input type="checkbox" id="edit_synapse_left">');
        $('#edit_synapse').append('<label class="left">&lt;</label>');
        $('#edit_synapse').append('<input type="checkbox" id="edit_synapse_right">');
        $('#edit_synapse').append('<label class="right">&gt;</label>');

        var edge = synapse.get('edge');

        //determine which node is to the left and the right
        //if directly in a line, top is left
        if (edge.nodeFrom.pos.x < edge.nodeTo.pos.x ||
            edge.nodeFrom.pos.x == edge.nodeTo.pos.x &&
            edge.nodeFrom.pos.y < edge.nodeTo.pos.y) {
            var left = edge.nodeTo;
            var right = edge.nodeFrom;
        } else {
            var left = edge.nodeFrom;
            var right = edge.nodeTo;
        }

        /*
         * One node is actually on the left onscreen. Call it left, & the other right.
         * If category is from-to, and that node is first, check the 'right' checkbox.
         * Else check the 'left' checkbox since the arrow is incoming.
         */

        var directionCat = synapse.get('category'); //both, none, from-to
        if (directionCat == 'from-to') {
            var from_to = synapse.getDirection();
            if (from_to[0] == left.id) {
                //check left checkbox
                $('#edit_synapse_left').prop('checked', true);
            } else {
                //check right checkbox
                $('#edit_synapse_right').prop('checked', true);
            }
        } else if (directionCat == 'both') {
            //check both checkboxes
            $('#edit_synapse_left').prop('checked', true);
            $('#edit_synapse_right').prop('checked', true);
        }
        $('#edit_synapse_left, #edit_synapse_right').click(function () {
            var leftChecked = $('#edit_synapse_left').is(':checked');
            var rightChecked = $('#edit_synapse_right').is(':checked');

            var dir = synapse.getDirection();
            var dirCat = 'none';
            if (leftChecked && rightChecked) {
                dirCat = 'both';
            } else if (!leftChecked && rightChecked) {
                dirCat = 'from-to';
                dir = [right.id, left.id];
            } else if (leftChecked && !rightChecked) {
                dirCat = 'from-to';
                dir = [left.id, right.id];
            }

            synapse.save({
                category: dirCat,
                node1_id: dir[0],
                node2_id: dir[1]
            });
            Metamaps.Visualize.mGraph.plot();
        });
    } //add_direction_form
}; // end Metamaps.SynapseCard


////////////////////// END TOPIC AND SYNAPSE CARDS //////////////////////////////////




/*
 *
 *   VISUALIZE
 *
 */
Metamaps.Visualize = {
    mGraph: null, // a reference to the graph object.
    cameraPosition: null, // stores the camera position when using a 3D visualization
    type: "ForceDirected", // the type of graph we're building, could be "RGraph", "ForceDirected", or "ForceDirected3D"
    loadLater: false, // indicates whether there is JSON that should be loaded right in the offset, or whether to wait till the first topic is created
    init: function () {
        var self = Metamaps.Visualize;
        // disable awkward dragging of the canvas element that would sometimes happen
        $('#infovis-canvas').on('dragstart', function (event) {
            event.preventDefault();
        });

        // prevent touch events on the canvas from default behaviour
        $("#infovis-canvas").bind('touchstart', function (event) {
            event.preventDefault();
            self.mGraph.events.touched = true;
        });

        // prevent touch events on the canvas from default behaviour
        $("#infovis-canvas").bind('touchmove', function (event) {
            //Metamaps.JIT.touchPanZoomHandler(event);
        });

        // prevent touch events on the canvas from default behaviour
        $("#infovis-canvas").bind('touchend touchcancel', function (event) {
            lastDist = 0;
            if (!self.mGraph.events.touchMoved && !Metamaps.Touch.touchDragNode) Metamaps.TopicCard.hideCurrentCard();
            self.mGraph.events.touched = self.mGraph.events.touchMoved = false;
            Metamaps.Touch.touchDragNode = false;
        });
    },
    computePositions: function () {
        var self = Metamaps.Visualize,
            mapping;

        if (self.type == "RGraph") {
            self.mGraph.graph.eachNode(function (n) {
                topic = Metamaps.Topics.get(n.id);
                topic.set('node', n);
                topic.updateNode();

                n.eachAdjacency(function (edge) {
                    l = edge.getData('synapseIDs').length;
                    for (i = 0; i < l; i++) {
                        synapse = Metamaps.Synapses.get(edge.getData('synapseIDs')[i]);
                        synapse.set('edge', edge);
                        synapse.updateEdge();
                    }
                });
                
                var pos = n.getPos();
                pos.setc(-200, -200);
            });
            self.mGraph.compute('end');
        } else if (self.type == "ForceDirected") {
            var i, l, startPos, endPos, topic, synapse;

            self.mGraph.graph.eachNode(function (n) {
                topic = Metamaps.Topics.get(n.id);
                topic.set('node', n);
                topic.updateNode();
                mapping = topic.getMapping();

                n.eachAdjacency(function (edge) {
                    l = edge.getData('synapseIDs').length;
                    for (i = 0; i < l; i++) {
                        synapse = Metamaps.Synapses.get(edge.getData('synapseIDs')[i]);
                        synapse.set('edge', edge);
                        synapse.updateEdge();
                    }
                });

                startPos = new $jit.Complex(0, 0);
                endPos = new $jit.Complex(mapping.get('xloc'), mapping.get('yloc'));
                n.setPos(startPos, 'start');
                n.setPos(endPos, 'end');
            });
        } else if (self.type == "ForceDirected3D") {
            self.mGraph.compute();
        }
    },
    /**
     * render does the heavy lifting of creating the engine that renders the graph with the properties we desire
     *
     * @param vizData a json structure containing the data to be rendered.
     */
    render: function () {
        var self = Metamaps.Visualize, RGraphSettings, FDSettings;

        if (self.type == "RGraph" && (!self.mGraph || self.mGraph instanceof $jit.ForceDirected)) {

            RGraphSettings = $.extend(true, {}, Metamaps.JIT.ForceDirected.graphSettings);

            $jit.RGraph.Plot.NodeTypes.implement(Metamaps.JIT.ForceDirected.nodeSettings);
            $jit.RGraph.Plot.EdgeTypes.implement(Metamaps.JIT.ForceDirected.edgeSettings);
            
            RGraphSettings.width = $(document).width();
            RGraphSettings.height = $(document).height();
            RGraphSettings.background = Metamaps.JIT.RGraph.background;
            RGraphSettings.levelDistance = Metamaps.JIT.RGraph.levelDistance;
            
            self.mGraph = new $jit.RGraph(RGraphSettings);

        } else if (self.type == "ForceDirected" && (!self.mGraph || self.mGraph instanceof $jit.RGraph)) {

            FDSettings = $.extend(true, {}, Metamaps.JIT.ForceDirected.graphSettings);

            $jit.ForceDirected.Plot.NodeTypes.implement(Metamaps.JIT.ForceDirected.nodeSettings);
            $jit.ForceDirected.Plot.EdgeTypes.implement(Metamaps.JIT.ForceDirected.edgeSettings);
            
            FDSettings.width = $(document).width();
            FDSettings.height = $(document).height();

            self.mGraph = new $jit.ForceDirected(FDSettings);

        } else if (self.type == "ForceDirected3D" && !self.mGraph) {
            // init ForceDirected3D
            self.mGraph = new $jit.ForceDirected3D(Metamaps.JIT.ForceDirected3D.graphSettings);
            self.cameraPosition = self.mGraph.canvas.canvases[0].camera.position;
        }
        else {
            self.mGraph.graph.empty();
        }

        Metamaps.Loading.hide();
        // load JSON data, if it's not empty
        if (!self.loadLater) {
            //load JSON data.
            var rootIndex = 0;
            if (Metamaps.Active.Topic) {
                var node = _.find(Metamaps.JIT.vizData, function(node){
                    return node.id === Metamaps.Active.Topic.id;
                });
                rootIndex = _.indexOf(Metamaps.JIT.vizData, node);
            }
            self.mGraph.loadJSON(Metamaps.JIT.vizData, rootIndex);
            //compute positions and plot.
            self.computePositions();
            if (self.type == "RGraph") {
                self.mGraph.fx.animate(Metamaps.JIT.RGraph.animate);
            } else if (self.type == "ForceDirected") {
                self.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);
            } else if (self.type == "ForceDirected3D") {
                self.mGraph.animate(Metamaps.JIT.ForceDirected.animateFDLayout);
            }
        }

        // update the url now that the map is ready
        setTimeout(function(){
            var m = Metamaps.Active.Map;
            var t = Metamaps.Active.Topic;

            if (m && window.location.pathname !== "/maps/" + m.id) {
                Metamaps.Router.navigate("/maps/" + m.id);
            }
            else if (t && window.location.pathname !== "/topics/" + t.id) {
                Metamaps.Router.navigate("/topics/" + t.id);
            }
        }, 800);

    }
}; // end Metamaps.Visualize


/*
 *
 *   UTIL
 *
 */
Metamaps.Util = {
    // helper function to determine how many lines are needed
    // Line Splitter Function
    // copyright Stephen Chapman, 19th April 2006
    // you may copy this code but please keep the copyright notice as well
    splitLine: function (st, n) {
        var b = '';
        var s = st ? st : '';
        while (s.length > n) {
            var c = s.substring(0, n);
            var d = c.lastIndexOf(' ');
            var e = c.lastIndexOf('\n');
            if (e != -1) d = e;
            if (d == -1) d = n;
            b += c.substring(0, d) + '\n';
            s = s.substring(d + 1);
        }
        return b + s;
    },
    nowDateFormatted: function () {
        var date = new Date(Date.now());
        var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var year = date.getFullYear();

        return month + '/' + day + '/' + year;
    },
    decodeEntities: function (desc) {
        var str, temp = document.createElement('p');
        temp.innerHTML = desc; //browser handles the topics
        str = temp.textContent || temp.innerText;
        temp = null; //delete the element;
        return str;
    }, //decodeEntities
    getDistance: function (p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
    },
    coordsToPixels: function (coords) {
        var canvas = Metamaps.Visualize.mGraph.canvas,
            s = canvas.getSize(),
            p = canvas.getPos(),
            ox = canvas.translateOffsetX,
            oy = canvas.translateOffsetY,
            sx = canvas.scaleOffsetX,
            sy = canvas.scaleOffsetY;
        var pixels = {
          x: (coords.x / (1/sx)) + p.x + s.width/2 + ox,
          y: (coords.y / (1/sy)) + p.y + s.height/2 + oy
        };
        return pixels;
    },
    pixelsToCoords: function (pixels) {
        var canvas = Metamaps.Visualize.mGraph.canvas,
            s = canvas.getSize(),
            p = canvas.getPos(),
            ox = canvas.translateOffsetX,
            oy = canvas.translateOffsetY,
            sx = canvas.scaleOffsetX,
            sy = canvas.scaleOffsetY;
        var coords = {
            x: (pixels.x - p.x - s.width/2 - ox) * (1/sx),
            y: (pixels.y - p.y - s.height/2 - oy) * (1/sy),
        };
        return coords;
    },
    getPastelColor: function () {
        var r = (Math.round(Math.random()* 127) + 127).toString(16);
        var g = (Math.round(Math.random()* 127) + 127).toString(16);
        var b = (Math.round(Math.random()* 127) + 127).toString(16);
        return Metamaps.Util.colorLuminance('#' + r + g + b, -0.4);
    },
    // darkens a hex value by 'lum' percentage
    colorLuminance: function (hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;
    },
    generateOptionsList: function (data) {
        var newlist = "";
        for (var i = 0; i < data.length; i++) {
            newlist = newlist + '<option value="' + data[i]['id'] + '">' + data[i]['1'][1] + '</option>';
        }
        return newlist;
    },
    checkURLisImage: function (url) {
        // when the page reloads the following regular expression will be screwed up
        // please replace it with this one before you save: /*backslashhere*.(jpeg|jpg|gif|png)$/ 
        return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    },
    checkURLisYoutubeVideo: function (url) {
        return (url.match(/^http:\/\/(?:www\.)?youtube.com\/watch\?(?=[^?]*v=\w+)(?:[^\s?]+)?$/) != null);
    }
}; // end Metamaps.Util

/*
 *
 *   REALTIME
 *
 */
Metamaps.Realtime = {
    // this is for the heroku staging environment
    //Metamaps.Realtime.socket = io.connect('http://gentle-savannah-1303.herokuapp.com'); 
    // this is for metamaps.cc
    //Metamaps.Realtime.socket = io.connect('http://metamaps.cc:5001');    
    // this is for localhost development    
    //Metamaps.Realtime.socket = io.connect('http://localhost:5001'); 
    socket: null,
    isOpen: false,
    changing: false,
    mappersOnMap: {},
    status: true, // stores whether realtime is True/On or False/Off
    init: function () {
        var self = Metamaps.Realtime;

        var turnOn = function () {
            self.turnOn(true);
        }
        $(".rtOn").click(turnOn);
        $(".rtOff").click(self.turnOff);

        $('.sidebarCollaborateIcon').click(self.toggleBox);
        $('.sidebarCollaborateBox').click(function(event){ 
            event.stopPropagation();
        });
        $('body').click(self.close);

        self.socket = io.connect('http://gentle-savannah-1303.herokuapp.com');  
        self.startActiveMap();
    },
    toggleBox: function (event) {
        var self = Metamaps.Realtime;

        if (self.isOpen) self.close();
        else self.open();

        event.stopPropagation();
    },
    open: function () {
        var self = Metamaps.Realtime;

        Metamaps.GlobalUI.Account.close();
        Metamaps.Filter.close();

        if (!self.isOpen && !self.changing) {
            self.changing = true;
            $('.sidebarCollaborateBox').fadeIn(200, function () {
                self.changing = false;
                self.isOpen = true;
            });
        }
    },
    close: function () {
        var self = Metamaps.Realtime;

        if (!self.changing) {
            self.changing = true;
            $('.sidebarCollaborateBox').fadeOut(200, function () {
                self.changing = false;
                self.isOpen = false;
            });
        }
    },
    startActiveMap: function () {
        var self = Metamaps.Realtime;

        var mapperm = Metamaps.Active.Map && Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper);

        var start = function() {
            if (mapperm) {
                self.turnOn();
                self.setupSocket();
            }
        }

        if (!self.socket.connected) {
            self.socket.socket.connect();
        }
        self.socket.on('connect', function () {
            start();
        });
    },
    endActiveMap: function () {
        var self = Metamaps.Realtime;

        $(document).off(Metamaps.JIT.events.mouseMove);
        self.socket.disconnect();
        self.socket.removeAllListeners();
        $(".collabCompass").remove();
        self.status = false;
    },
    turnOn: function (notify) {
        var self = Metamaps.Realtime;

        if (!self.status) {
            if (notify) self.sendRealtimeOn();
            $(".rtMapperSelf").removeClass('littleRtOff').addClass('littleRtOn');
            self.status = true;
            $(".sidebarCollaborateIcon").addClass("blue");
            $(".collabCompass").show();
        }
    },
    turnOff: function () {
        var self = Metamaps.Realtime;

        if (self.status) {
            self.sendRealtimeOff();
            $(".rtMapperSelf").removeClass('littleRtOn').addClass('littleRtOff');
            self.status = false;
            $(".sidebarCollaborateIcon").removeClass("blue");
            $(".collabCompass").hide();
        }
    },
    setupSocket: function () {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;
        var myId = Metamaps.Active.Mapper.id;
        
        socket.emit('newMapperNotify', {
            userid: myId,
            username: Metamaps.Active.Mapper.get("name"),
            userimage: Metamaps.Active.Mapper.get("image"),
            mapid: Metamaps.Active.Map.id
        });

        // if you're the 'new guy' update your list with who's already online
        socket.on(myId + '-' + Metamaps.Active.Map.id + '-UpdateMapperList', self.updateMapperList);

        // receive word that there's a new mapper on the map
        socket.on('maps-' + Metamaps.Active.Map.id + '-newmapper', self.newPeerOnMap);

        // receive word that a mapper left the map
        socket.on('maps-' + Metamaps.Active.Map.id + '-lostmapper', self.lostPeerOnMap);

        // receive word that there's a mapper turned on realtime
        socket.on('maps-' + Metamaps.Active.Map.id + '-newrealtime', self.newCollaborator);

        // receive word that there's a mapper turned on realtime
        socket.on('maps-' + Metamaps.Active.Map.id + '-lostrealtime', self.lostCollaborator);

        socket.on('maps-' + Metamaps.Active.Map.id, self.contentUpdate);

        // update mapper compass position
        socket.on('maps-' + Metamaps.Active.Map.id + '-updatePeerCoords', self.updatePeerCoords);
    
        var sendCoords = function (event, coords) {
            self.sendCoords(coords);
        };
        var zoom = function (event, e) {
            if (e) {
                var pixels = {
                    x: e.pageX,
                    y: e.pageY
                };
                var coords = Metamaps.Util.pixelsToCoords(pixels);
                self.sendCoords(coords);
            }
            self.positionPeerIcons();
        };
        $(document).on(Metamaps.JIT.events.mouseMove, sendCoords);
        $(document).on(Metamaps.JIT.events.zoom, zoom);
        $(document).on(Metamaps.JIT.events.pan, self.positionPeerIcons);
    },
    sendRealtimeOn: function () {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        // send this new mapper back your details, and the awareness that you're online
        var update = {
            username: Metamaps.Active.Mapper.get("name"),
            userid: Metamaps.Active.Mapper.id,
            mapid: Metamaps.Active.Map.id
        };
        socket.emit('notifyStartRealtime', update);
    },
    sendRealtimeOff: function () {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        // send this new mapper back your details, and the awareness that you're online
        var update = {
            username: Metamaps.Active.Mapper.get("name"),
            userid: Metamaps.Active.Mapper.id,
            mapid: Metamaps.Active.Map.id
        };
        socket.emit('notifyStopRealtime', update);
    },
    updateMapperList: function (data) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        // data.userid
        // data.username
        // data.userimage
        // data.userrealtime

        self.mappersOnMap[data.userid] = {
            name: data.username,
            image: data.userimage,
            color: Metamaps.Util.getPastelColor(),
            realtime: data.userrealtime,
            coords: {
                x: 0, 
                y: 0
            },
        };

        var onOff = data.userrealtime ? "On" : "Off";
        var mapperListItem = '<li id="mapper';
        mapperListItem += data.userid;
        mapperListItem += '" class="rtMapper littleRt';
        mapperListItem += onOff;
        mapperListItem += '">';
        mapperListItem += '<img src="' + data.userimage + '" width="24" height="24" class="rtUserImage" />';
        mapperListItem += data.username;
        mapperListItem += '<div class="littleJuntoIcon"></div>';
        mapperListItem += '</li>';

        if (data.userid !== Metamaps.Active.Mapper.id) {
            $('#mapper' + data.userid).remove();
            $('.realtimeMapperList ul').append(mapperListItem);

            // create a div for the collaborators compass
            self.createCompass(data.username, data.userid, data.userimage, self.mappersOnMap[data.userid].color);
        }
    },
    newPeerOnMap: function (data) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        // data.userid
        // data.username
        // data.userimage
        // data.coords

        self.mappersOnMap[data.userid] = {
            name: data.username,
            image: data.userimage,
            color: Metamaps.Util.getPastelColor(),
            realtime: true,
            coords: {
                x: 0, 
                y: 0
            },
        };

        // create an item for them in the realtime box
        if (data.userid !== Metamaps.Active.Mapper.id) {
            var mapperListItem = '<li id="mapper' + data.userid + '" class="rtMapper littleRtOn">';
            mapperListItem += '<img src="' + data.userimage + '" width="24" height="24" class="rtUserImage" />';
            mapperListItem += data.username;
            mapperListItem += '<div class="littleJuntoIcon"></div>';
            mapperListItem += '</li>';
            $('#mapper' + data.userid).remove();
            $('.realtimeMapperList ul').append(mapperListItem);

            // create a div for the collaborators compass
            self.createCompass(data.username, data.userid, data.userimage, self.mappersOnMap[data.userid].color);
            
            Metamaps.GlobalUI.notifyUser(data.username + ' just joined the map');

            // send this new mapper back your details, and the awareness that you've loaded the map
            var update = {
                userToNotify: data.userid,
                username: Metamaps.Active.Mapper.get("name"),
                userimage: Metamaps.Active.Mapper.get("image"),
                userid: Metamaps.Active.Mapper.id,
                userrealtime: self.status,
                mapid: Metamaps.Active.Map.id
            };
            socket.emit('updateNewMapperList', update);
        }
    },
    createCompass: function(name, id, image, color) {
        var str =  '<img width="28" height="28" src="'+image+'" /><p>'+name+'</p>';
        str += '<div id="compassArrow'+id+'" class="compassArrow"></div>';
        $('#compass' + id).remove();
        $('<div/>', {
            id: 'compass' + id,
            class: 'collabCompass'
        }).html(str).appendTo('#wrapper');
        $('#compass' + id + ' img').css({
            'border': '2px solid ' + color
        });
        $('#compass' + id + ' p').css({
            'background-color': color
        });
    },
    lostPeerOnMap: function (data) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        // data.userid
        // data.username

        delete self.mappersOnMap[data.userid];

        $('#mapper' + data.userid).remove();
        $('#compass' + data.userid).remove();

        Metamaps.GlobalUI.notifyUser(data.username + ' just left the map');
    },
    newCollaborator: function (data) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        // data.userid
        // data.username

        self.mappersOnMap[data.userid].realtime = true;

        $('#mapper' + data.userid).removeClass('littleRtOff').addClass('littleRtOn');
        $('#compass' + data.userid).show();

        Metamaps.GlobalUI.notifyUser(data.username + ' just turned on realtime');
    },
    lostCollaborator: function (data) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        // data.userid
        // data.username

        self.mappersOnMap[data.userid].realtime = false;

        $('#mapper' + data.userid).removeClass('littleRtOn').addClass('littleRtOff');
        $('#compass' + data.userid).hide();

        Metamaps.GlobalUI.notifyUser(data.username + ' just turned off realtime');
    },
    updatePeerCoords: function (data) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        self.mappersOnMap[data.userid].coords={x: data.usercoords.x,y:data.usercoords.y};
        self.positionPeerIcon(data.userid);
    },
    positionPeerIcons: function () {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        if (self.status) { // if i have realtime turned on
            for (var key in self.mappersOnMap) {
                var mapper = self.mappersOnMap[key];
                if (mapper.realtime) {
                    self.positionPeerIcon(key);
                }
            }
        }
    },
    positionPeerIcon: function (id) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        var mapper = self.mappersOnMap[id];
        var xMax=$(document).width();
        var yMax=$(document).height();
        var compassDiameter=56;
        var compassArrowSize=24;
        
        var origPixels = Metamaps.Util.coordsToPixels(mapper.coords);
        var pixels = self.limitPixelsToScreen(origPixels);
        $('#compass' + id).css({
            left: pixels.x + 'px',
            top: pixels.y + 'px'
        });
        /* showing the arrow if the collaborator is off of the viewport screen */
        if (origPixels.x !== pixels.x || origPixels.y !== pixels.y) {

            var dy = origPixels.y - pixels.y; //opposite
            var dx = origPixels.x - pixels.x; // adjacent
            var ratio = dy / dx;
            var angle = Math.atan2(dy, dx);
            
            $('#compassArrow' + id).show().css({
                transform: 'rotate(' + angle + 'rad)',
                "-webkit-transform": 'rotate(' + angle + 'rad)',
            });
            
            if (dx > 0) {
                $('#compass' + id).addClass('labelLeft');
            }
        } else {
            $('#compassArrow' + id).hide();
            $('#compass' + id).removeClass('labelLeft');
        }
    },
    limitPixelsToScreen: function (pixels) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        var xLimit, yLimit;
        var xMax=$(document).width();
        var yMax=$(document).height();
        var compassDiameter=56;
        var compassArrowSize=24;
        
        xLimit = Math.max(0 + compassArrowSize, pixels.x);
        xLimit = Math.min(xLimit, xMax - compassDiameter);
        yLimit = Math.max(0 + compassArrowSize, pixels.y);
        yLimit = Math.min(yLimit, yMax - compassDiameter);
        
        return {x:xLimit,y:yLimit};
    },
    sendCoords: function (coords) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;

        var map = Metamaps.Active.Map;
        var mapper = Metamaps.Active.Mapper;

        if (self.status && map.authorizeToEdit(mapper) && socket) {
            var update = {
                usercoords: coords,
                userid: Metamaps.Active.Mapper.id,
                mapid: Metamaps.Active.Map.id
            };
            socket.emit('updateMapperCoords', update);
        }
    },
    contentUpdate: function (data) {
        var self = Metamaps.Realtime;
        var socket = Metamaps.Realtime.socket;
        var graph = Metamaps.Visualize.mGraph.graph;

        //as long as you weren't the origin of the changes, update your map
        if (data.origin != Metamaps.Active.Mapper.id && self.status) {
            if (data.resource == 'Topic') {
                topic = $.parseJSON(data.obj);

                if (data.action == 'create') {
                    self.addTopicToMap(topic);
                } else if (data.action == 'update' && graph.getNode(topic.id) != 'undefined') {
                    self.updateTopicOnMap(topic);
                } else if (data.action == 'destroy' && graph.getNode(topic.id) != 'undefined') {
                    Metamaps.Control.hideNode(topic.id)
                }

                return;
            } else if (data.resource == 'Synapse') {
                synapse = $.parseJSON(data.obj);

                if (data.action == 'create') {
                    self.addSynapseToMap(synapse);
                } else if (data.action == 'update' &&
                    graph.getAdjacence(synapse.data.$direction['0'], synapse.data.$direction['1']) != 'undefined') {
                    self.updateSynapseOnMap(synapse);
                } else if (data.action == 'destroy' &&
                    graph.getAdjacence(synapse.data.$direction['0'], synapse.data.$direction['1']) != 'undefined') {
                    var edge = graph.getAdjacence(synapse.data.$direction['0'], synapse.data.$direction['1']);
                    Metamaps.Control.hideEdge(edge);
                }

                return;
            }
        }
    },
    addTopicToMap: function (topic) {

        // TODO
        var newPos, tempForT;
        Metamaps.Visualize.mGraph.graph.addNode(topic);
        tempForT = Metamaps.Visualize.mGraph.graph.getNode(topic.id);
        tempForT.setData('dim', 1, 'start');
        tempForT.setData('dim', 25, 'end');
        newPos = new $jit.Complex();
        newPos.x = tempForT.data.$xloc;
        newPos.y = tempForT.data.$yloc;
        tempForT.setPos(newPos, 'start');
        tempForT.setPos(newPos, 'current');
        tempForT.setPos(newPos, 'end');
        Metamaps.Visualize.mGraph.fx.plotNode(tempForT, Metamaps.Visualize.mGraph.canvas);
    },
    updateTopicOnMap: function (topic) {

        // TODO
        var newPos, tempForT;
        tempForT = Metamaps.Visualize.mGraph.graph.getNode(topic.id);
        tempForT.data = topic.data;
        tempForT.name = topic.name;
        if (MetamapsModel.showcardInUse === topic.id) {
            populateShowCard(tempForT);
        }
        newPos = new $jit.Complex();
        newPos.x = tempForT.data.$xloc;
        newPos.y = tempForT.data.$yloc;
        tempForT.setPos(newPos, 'start');
        tempForT.setPos(newPos, 'current');
        tempForT.setPos(newPos, 'end');
        return Metamaps.Visualize.mGraph.fx.animate({
            modes: ['linear', 'node-property:dim', 'edge-property:lineWidth'],
            transition: $jit.Trans.Quad.easeInOut,
            duration: 500
        });
    },
    addSynapseToMap: function (synapse) {

        // TODO
        var Node1, Node2, tempForS;
        Node1 = Metamaps.Visualize.mGraph.graph.getNode(synapse.data.$direction[0]);
        Node2 = Metamaps.Visualize.mGraph.graph.getNode(synapse.data.$direction[1]);
        Metamaps.Visualize.mGraph.graph.addAdjacence(Node1, Node2, {});
        tempForS = Metamaps.Visualize.mGraph.graph.getAdjacence(Node1.id, Node2.id);
        tempForS.setDataset('start', {
            lineWidth: 0.4
        });
        tempForS.setDataset('end', {
            lineWidth: 2
        });
        tempForS.data = synapse.data;
        Metamaps.Visualize.mGraph.fx.plotLine(tempForS, Metamaps.Visualize.mGraph.canvas);
        return Metamaps.Visualize.mGraph.fx.animate({
            modes: ['linear', 'node-property:dim', 'edge-property:lineWidth'],
            transition: $jit.Trans.Quad.easeInOut,
            duration: 500
        });
    },
    updateSynapseOnMap: function (synapse) {

        // TODO
        var k, tempForS, v, wasShowDesc, _ref;
        tempForS = Metamaps.Visualize.mGraph.graph.getAdjacence(synapse.data.$direction[0], synapse.data.$direction[1]);
        wasShowDesc = tempForS.data.$showDesc;
        _ref = synapse.data;
        for (k in _ref) {
            v = _ref[k];
            tempForS.data[k] = v;
        }
        tempForS.data.$showDesc = wasShowDesc;
        if (MetamapsModel.edgecardInUse === synapse.data.$id) { // TODO
            editEdge(tempForS, false);
        }
        return Metamaps.Visualize.mGraph.plot();
    }
}; // end Metamaps.Realtime


/*
 *
 *   CONTROL
 *
 */
Metamaps.Control = {
    init: function () {

    },
    selectNode: function (node,e) {
        if (Metamaps.Selected.Nodes.indexOf(node) != -1) return;
        node.selected = true;
        node.setData('dim', 30, 'current');
        /*
		if(!(e.ctrlKey) && !(e.altKey)){
			node.eachAdjacency(function (adj) {
				Metamaps.Control.selectEdge(adj);
			});
		}
        */
		
        Metamaps.Selected.Nodes.push(node);
    },
    deselectAllNodes: function () {
        var l = Metamaps.Selected.Nodes.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var node = Metamaps.Selected.Nodes[i];
            Metamaps.Control.deselectNode(node);
        }
        Metamaps.Visualize.mGraph.plot();
    },
    deselectNode: function (node) {
        delete node.selected;
		/*
        node.eachAdjacency(function (adj) {
            Metamaps.Control.deselectEdge(adj);
        });
		*/
        node.setData('dim', 25, 'current');

        //remove the node
        Metamaps.Selected.Nodes.splice(
            Metamaps.Selected.Nodes.indexOf(node), 1);
    },
    deleteSelectedNodes: function () { // refers to deleting topics permanently
        var l = Metamaps.Selected.Nodes.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var node = Metamaps.Selected.Nodes[i];
            Metamaps.Control.deleteNode(node.id);
        }
    },
    deleteNode: function (nodeid) { // refers to deleting topics permanently
        var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid);
        Metamaps.Control.deselectNode(node);
        Metamaps.Topics.get(nodeid).destroy();
        Metamaps.Control.hideNode(nodeid);
    },
    removeSelectedNodes: function () { // refers to removing topics permanently from a map
        var l = Metamaps.Selected.Nodes.length,
            i,
            node,
            mapperm = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper);

        if (mapperm) {
            for (i = l - 1; i >= 0; i -= 1) {
                node = Metamaps.Selected.Nodes[i];
                Metamaps.Control.removeNode(node.id);
            }
        }
    },
    removeNode: function (nodeid) { // refers to removing topics permanently from a map
        var mapperm = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper);
        var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid);

        if (mapperm) {
            Metamaps.Control.deselectNode(node);
            node.getData('mapping').destroy();
            Metamaps.Control.hideNode(nodeid);
        }
    },
    hideSelectedNodes: function () {
        var l = Metamaps.Selected.Nodes.length,
            i,
            node;

        for (i = l - 1; i >= 0; i -= 1) {
            node = Metamaps.Selected.Nodes[i];
            Metamaps.Control.hideNode(node.id);
        }
    },
    hideNode: function (nodeid) {
        var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid);
        if (nodeid == Metamaps.Visualize.mGraph.root) { // && Metamaps.Visualize.type === "RGraph"
            alert("You can't hide this topic, it is the root of your graph.");
            return;
        }

        Metamaps.Control.deselectNode(node);

        node.setData('alpha', 0, 'end');
        node.eachAdjacency(function (adj) {
            adj.setData('alpha', 0, 'end');
        });
        Metamaps.Visualize.mGraph.fx.animate({
            modes: ['node-property:alpha',
            'edge-property:alpha'
        ],
            duration: 500
        });
        setTimeout(function () {
            Metamaps.Visualize.mGraph.graph.removeNode(nodeid);
        }, 500);
        Metamaps.Filter.checkMetacodes();
        Metamaps.Filter.checkMappers();
    },
    selectEdge: function (edge) {
        if (edge.getData('alpha') === 0) return; // don't do anything if the edge is filtered
        if (Metamaps.Selected.Edges.indexOf(edge) != -1) return;
        edge.setData('showDesc', true, 'current');
        if (!Metamaps.Settings.embed) {
            edge.setDataset('end', {
                lineWidth: 4,
                color: Metamaps.Settings.colors.synapses.selected,
                alpha: 1
            });
        } else if (Metamaps.Settings.embed) {
            edge.setDataset('end', {
                lineWidth: 4,
                color: Metamaps.Settings.colors.synapses.selected,
                alpha: 1
            });
        }
        Metamaps.Visualize.mGraph.fx.animate({
            modes: ['edge-property:lineWidth:color:alpha'],
            duration: 100
        });
        Metamaps.Selected.Edges.push(edge);
    },
    deselectAllEdges: function () {
        var l = Metamaps.Selected.Edges.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var edge = Metamaps.Selected.Edges[i];
            Metamaps.Control.deselectEdge(edge);
        }
        Metamaps.Visualize.mGraph.plot();
    },
    deselectEdge: function (edge) {
        if (edge.getData('alpha') === 0) return; // don't do anything if the edge is filtered
        edge.setData('showDesc', false, 'current');
        edge.setDataset('end', {
            lineWidth: 2,
            color: Metamaps.Settings.colors.synapses.normal,
            alpha: 0.4
        });

        if (Metamaps.Mouse.edgeHoveringOver == edge) {
            edge.setData('showDesc', true, 'current');
            edge.setDataset('end', {
                lineWidth: 4,
                color: Metamaps.Settings.colors.synapses.hover,
                alpha: 1
            });
        }

        Metamaps.Visualize.mGraph.fx.animate({
            modes: ['edge-property:lineWidth:color:alpha'],
            duration: 100
        });

        //remove the edge
        Metamaps.Selected.Edges.splice(
            Metamaps.Selected.Edges.indexOf(edge), 1);
    },
    deleteSelectedEdges: function () { // refers to deleting topics permanently
        var edge,
            l = Metamaps.Selected.Edges.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            edge = Metamaps.Selected.Edges[i];
            Metamaps.Control.deleteEdge(edge);
        }
    },
    deleteEdge: function (edge) {

        // TODO make it so that you select which one, of multiple possible synapses you want to delete

        //var id = edge.getData("id");
        //Metamaps.Synapses.get(id).destroy();
        //Metamaps.Control.hideEdge(edge);
    },
    removeSelectedEdges: function () {
        var l = Metamaps.Selected.Edges.length,
            i,
            edge;

        if (Metamaps.Active.Map) {
            for (i = l - 1; i >= 0; i -= 1) {
                edge = Metamaps.Selected.Edges[i];
                Metamaps.Control.removeEdge(edge);
            }
            Metamaps.Selected.Edges = new Array();
        }
    },
    removeEdge: function (edge) {

        // TODO make it so that you select which one, of multiple possible synapses you want

        //var mappingid = edge.getData("mappingid");
        //Metamaps.Mappings.get(mappingid).destroy();
        //Metamaps.Control.hideEdge(edge);
    },
    hideSelectedEdges: function () {
        var edge,
            l = Metamaps.Selected.Edges.length,
            i;
        for (i = l - 1; i >= 0; i -= 1) {
            edge = Metamaps.Selected.Edges[i];
            Metamaps.Control.hideEdge(edge);
        }
        Metamaps.Selected.Edges = new Array();
    },
    hideEdge: function (edge) {
        var from = edge.nodeFrom.id;
        var to = edge.nodeTo.id;
        edge.setData('alpha', 0, 'end');
        Metamaps.Visualize.mGraph.fx.animate({
            modes: ['edge-property:alpha'],
            duration: 500
        });
        setTimeout(function () {
            Metamaps.Visualize.mGraph.graph.removeAdjacence(from, to);
        }, 500);
        Metamaps.Filter.checkSynapses();
        Metamaps.Filter.checkMappers();
    },
    updateSelectedPermissions: function (permission) {

        var edge, synapse, node, topic;

        Metamaps.GlobalUI.notifyUser('Working...');

        // variables to keep track of how many nodes and synapses you had the ability to change the permission of
        var nCount = 0,
            sCount = 0;

        // change the permission of the selected synapses, if logged in user is the original creator
        var l = Metamaps.Selected.Edges.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            edge = Metamaps.Selected.Edges[i];
            synapse = edge.getData('synapses')[0];

            if (synapse.authorizePermissionChange(Metamaps.Active.Mapper)) {
                synapse.save({
                    permission: permission
                });
                sCount++;
            }
        }

        // change the permission of the selected topics, if logged in user is the original creator
        var l = Metamaps.Selected.Nodes.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            node = Metamaps.Selected.Nodes[i];
            topic = node.getData('topic');

            if (topic.authorizePermissionChange(Metamaps.Active.Mapper)) {
                topic.save({
                    permission: permission
                });
                nCount++;
            }
        }

        var nString = nCount == 1 ? (nCount.toString() + ' topic and ') : (nCount.toString() + ' topics and ');
        var sString = sCount == 1 ? (sCount.toString() + ' synapse') : (sCount.toString() + ' synapses');

        var message = nString + sString + ' you created updated to ' + permission;
        Metamaps.GlobalUI.notifyUser(message);
    },
    updateSelectedMetacodes: function (metacode_id) {

        var node, topic;

        Metamaps.GlobalUI.notifyUser('Working...');

        var metacode = Metamaps.Metacodes.get(metacode_id);

        // variables to keep track of how many nodes and synapses you had the ability to change the permission of
        var nCount = 0;

        // change the permission of the selected topics, if logged in user is the original creator
        var l = Metamaps.Selected.Nodes.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            node = Metamaps.Selected.Nodes[i];
            topic = node.getData('topic');

            if (topic.authorizeToEdit(Metamaps.Active.Mapper)) {
                topic.save({
                    'metacode_id': metacode_id
                });
                nCount++;
            }
        }

        var nString = nCount == 1 ? (nCount.toString() + ' topic') : (nCount.toString() + ' topics');

        var message = nString + ' you can edit updated to ' + metacode.get('name');
        Metamaps.GlobalUI.notifyUser(message);
        Metamaps.Visualize.mGraph.plot();
    },
}; // end Metamaps.Control


/*
 *
 *   FILTER
 *
 */
Metamaps.Filter = {
    filters: {
        name: "",
        metacodes: [],
        mappers: [],
        synapses: []
    },
    visible: {
        metacodes: [],
        mappers: [],
        synapses: []
    },
    isOpen: false,
    changing: false,
    init: function () {
        var self = Metamaps.Filter;

        $('.sidebarFilterIcon').click(self.toggleBox);
        $('.sidebarFilterBox').click(function(event){ 
            event.stopPropagation();
        });
        $('body').click(self.close);

        $('.sidebarFilterBox .showAllMetacodes').click(self.filterNoMetacodes);
        $('.sidebarFilterBox .showAllSynapses').click(self.filterNoSynapses);
        $('.sidebarFilterBox .showAllMappers').click(self.filterNoMappers);
        $('.sidebarFilterBox .hideAllMetacodes').click(self.filterAllMetacodes);
        $('.sidebarFilterBox .hideAllSynapses').click(self.filterAllSynapses);
        $('.sidebarFilterBox .hideAllMappers').click(self.filterAllMappers);

        self.bindLiClicks();
	    self.getFilterData();
    },
    toggleBox: function (event) {
        var self = Metamaps.Filter;

        if (self.isOpen) self.close();
        else self.open();

        event.stopPropagation();
    },
    open: function () {
        var self = Metamaps.Filter;

        Metamaps.GlobalUI.Account.close();
        Metamaps.Realtime.close();

        if (!self.isOpen && !self.changing) {
            self.changing = true;

            var height = $(document).height() - 108;
            $('.sidebarFilterBox').css('max-height', height + 'px').fadeIn(200, function () {
                self.changing = false;
                self.isOpen = true;
            });
        }
    },
    close: function () {
        var self = Metamaps.Filter;

        if (!self.changing) {
            self.changing = true;

            $('.sidebarFilterBox').fadeOut(200, function () {
                self.changing = false;
                self.isOpen = false;
            });
        }
    },
    reset: function () {
        var self = Metamaps.Filter;

        self.filters.metacodes = [];
        self.filters.mappers = [];
        self.filters.synapses = [];
        self.visible.metacodes = [];
        self.visible.mappers = [];
        self.visible.synapses = [];

        $('#filter_by_metacode ul').empty(); 
        $('#filter_by_mapper ul').empty();
        $('#filter_by_synapse ul').empty();
    },
    initializeFilterData: function () {
        var self = Metamaps.Filter;

        var check = function (filtersToUse, topicsOrSynapses, propertyToCheck) {
            Metamaps[topicsOrSynapses].each(function(model) {
                var prop = model.get(propertyToCheck) ? model.get(propertyToCheck).toString() : false;
                if (prop && self.visible[filtersToUse].indexOf(prop) === -1) {
                    self.visible[filtersToUse].push(prop);
                }
            });
        };
        check('metacodes', 'Topics', 'metacode_id');
        check('mappers', 'Mappings', 'user_id');
        check('synapses', 'Synapses', 'desc');
    },
    /*  
    Most of this data essentially depends on the ruby function which are happening for filter inside view filterBox
    But what these function do is load this data into three accessible array within java : metacodes, mappers and synapses
    */
    getFilterData: function () {
        var self = Metamaps.Filter;

        var metacode, mapper, synapse;

        $('#filter_by_metacode li').each(function() {
            metacode = $( this ).attr('data-id');
            self.filters.metacodes.push(metacode);
            self.visible.metacodes.push(metacode);
        }); 

        $('#filter_by_mapper li').each(function()  {
            mapper = ($( this ).attr('data-id'));
            self.filters.mappers.push(mapper);
            self.visible.mappers.push(mapper);
        });

        $('#filter_by_synapse li').each(function()  {
            synapse = ($( this ).attr('data-id'));  
            self.filters.synapses.push(synapse);
            self.visible.synapses.push(synapse);
        });
    },
    bindLiClicks: function () {
        var self = Metamaps.Filter;
        $('#filter_by_metacode ul li').unbind().click(self.toggleMetacode);
        $('#filter_by_mapper ul li').unbind().click(self.toggleMapper);
        $('#filter_by_synapse ul li').unbind().click(self.toggleSynapse);
    },
    // an abstraction function for checkMetacodes, checkMappers, checkSynapses to reduce
    // code redundancy
    /*
    @param 
    */
    updateFilters: function (collection, propertyToCheck, correlatedModel, filtersToUse, listToModify) {
        var self = Metamaps.Filter;
        
        var newList = [];
        var removed = [];
        var added = [];
        
        Metamaps[collection].each(function(model) {
            var prop = model.get(propertyToCheck) ? model.get(propertyToCheck).toString() : false;
            if (prop && newList.indexOf(prop) === -1) {
                newList.push(prop);
            }
        });
        
        removed = _.difference(self.filters[filtersToUse], newList);
        added = _.difference(newList, self.filters[filtersToUse]);
        
        // remove the list items for things no longer present on the map
        _.each(removed, function(identifier) {
            $('#filter_by_' + listToModify + ' li[data-id="' + identifier + '"]').fadeOut('fast',function(){
                $(this).remove();
            });
            index = self.visible[filtersToUse].indexOf(identifier);
            self.visible[filtersToUse].splice(index, 1);
        });
        
        var model, li, jQueryLi;
        function sortAlpha(a,b){
            return a.childNodes[1].innerText.toLowerCase() > b.childNodes[1].innerText.toLowerCase() ? 1 : -1;  
        }
        // for each new filter to be added, create a list item for it and fade it in
        _.each(added, function (identifier) {
            model = Metamaps[correlatedModel].get(identifier) || 
                Metamaps[correlatedModel].find(function (model) {
                    return model.get(propertyToCheck) === identifier;
                });
            li = model.prepareLiForFilter();
            jQueryLi = $(li).hide();
            $('li', '#filter_by_' + listToModify + ' ul').add(jQueryLi.fadeIn("fast"))
                .sort(sortAlpha).appendTo('#filter_by_' + listToModify + ' ul');
            self.visible[filtersToUse].push(identifier);
        });

        // update the list of filters with the new list we just generated
        self.filters[filtersToUse] = newList;

        // make sure clicks on list items still trigger the right events
        self.bindLiClicks();
    },
    checkMetacodes: function () {
        var self = Metamaps.Filter;
        self.updateFilters('Topics', 'metacode_id', 'Metacodes', 'metacodes', 'metacode');
    },
    checkMappers: function () {
        var self = Metamaps.Filter;
        self.updateFilters('Mappings', 'user_id', 'Mappers', 'mappers', 'mapper');
    },
    checkSynapses: function () {
        var self = Metamaps.Filter;
        self.updateFilters('Synapses', 'desc', 'Synapses', 'synapses', 'synapse');
    },
    filterAllMetacodes: function (e) {
        var self = Metamaps.Filter;
        $('#filter_by_metacode ul li').addClass('toggledOff');
        self.visible.metacodes = [];
        self.passFilters();
    },
    filterNoMetacodes: function (e) {
        var self = Metamaps.Filter;
        $('#filter_by_metacode ul li').removeClass('toggledOff');
        self.visible.metacodes = self.filters.metacodes.slice();
        self.passFilters();
    },
    filterAllMappers: function (e) {
        var self = Metamaps.Filter;
        $('#filter_by_mapper ul li').addClass('toggledOff');
        self.visible.mappers = [];
        self.passFilters();       
    },
    filterNoMappers: function (e) {
        var self = Metamaps.Filter;
        $('#filter_by_mapper ul li').removeClass('toggledOff');
        self.visible.mappers = self.filters.mappers.slice();
        self.passFilters();
    },
    filterAllSynapses: function (e) {
        var self = Metamaps.Filter;
        $('#filter_by_synapse ul li').addClass('toggledOff');
        self.visible.synapses = [];
        self.passFilters();
    },
    filterNoSynapses: function (e) {
        var self = Metamaps.Filter;
        $('#filter_by_synapse ul li').removeClass('toggledOff');
        self.visible.synapses = self.filters.synapses.slice();
        self.passFilters();
    },
    // an abstraction function for toggleMetacode, toggleMapper, toggleSynapse
    // to reduce code redundancy
    // gets called in the context of a list item in a filter box
    toggleLi: function (whichToFilter) {
        var self = Metamaps.Filter, index;
        var id = $(this).attr("data-id");
        if (self.visible[whichToFilter].indexOf(id) == -1) {
            self.visible[whichToFilter].push(id);
            $(this).removeClass('toggledOff');
        }
        else {
            index = self.visible[whichToFilter].indexOf(id);
            self.visible[whichToFilter].splice(index, 1);
            $(this).addClass('toggledOff');
        }
        self.passFilters();
    },
    toggleMetacode: function () {
        var self = Metamaps.Filter;
        self.toggleLi.call(this, 'metacodes');
    },
    toggleMapper: function () {
        var self = Metamaps.Filter;
        self.toggleLi.call(this, 'mappers');
    },
    toggleSynapse: function () {
        var self = Metamaps.Filter;
        self.toggleLi.call(this, 'synapses');
    },
    passFilters: function () {        
        var self = Metamaps.Filter;
        var visible = self.visible;

        var passesMetacode, passesMapper, passesSynapse;
        var onMap;

        if (Metamaps.Active.Map) {
            onMap = true;
        }
        else passesMapper = true; // for when you're on a topic page

        Metamaps.Topics.each(function(topic) {
            var n = topic.get('node');
            var metacode_id = topic.get("metacode_id").toString();

            if (visible.metacodes.indexOf(metacode_id) == -1) passesMetacode = false;
            else passesMetacode = true;

            if (onMap) {
                var user_id = topic.getMapping().get("user_id").toString();
                if (visible.mappers.indexOf(user_id) == -1) passesMapper = false;
                else passesMapper = true;
            }

            if (passesMetacode && passesMapper) {
                if (n) {
                    n.setData('alpha', 1, 'end');
                }
                else console.log(topic);
            }
            else {
                if (n) {
                    // TODO quick deselect node
                    n.setData('alpha', 0, 'end');
                }
                else console.log(topic);
            }
        });
        Metamaps.Synapses.each(function(synapse) {
           var e = synapse.get('edge');
           var desc = synapse.get("desc");
           var user_id = synapse.get("user_id").toString();

            if (visible.synapses.indexOf(desc) == -1) passesSynapse = false;
            else passesSynapse = true;

            if (onMap) {
                var user_id = synapse.getMapping().get("user_id").toString();
                if (visible.mappers.indexOf(user_id) == -1) passesMapper = false;
                else passesMapper = true;
            }

            if (passesSynapse && passesMapper) {
                if (e) {
                    e.setData('alpha', 0.4, 'end');
                }
                else console.log(synapse);
            }
            else {
                if (e) {
                    // TODO quick deselect edge
                    e.setData('alpha', 0, 'end');
                }
                else console.log(synapse);
            } 
        });
            
        // run the animation
        Metamaps.Visualize.mGraph.fx.animate({  
          modes: ['node-property:alpha',  
                'edge-property:alpha'],  
          duration: 200  
        });
    }
}; // end Metamaps.Filter


/*
 *
 *   LISTENERS
 *
 */
Metamaps.Listeners = {

    init: function () {

        $(document).on('keydown', function (e) {
            switch (e.which) {
            case 13:
                if (Metamaps.Active.Map) Metamaps.JIT.enterKeyHandler();
                e.preventDefault();
                break;
            case 27:
                if (Metamaps.Active.Map) Metamaps.JIT.escKeyHandler();
                break;
            default:
                break; //alert(e.which);
            }
        });

        //$(window).resize(function () {
        //    Metamaps.Visualize.mGraph.canvas.resize($(window).width(), $(window).height());
        //});
    }
}; // end Metamaps.Listeners


/*
 *
 *   ORGANIZE
 *
 */
Metamaps.Organize = {
    init: function () {

    },
    arrange: function (layout, centerNode) {


        // first option for layout to implement is 'grid', will do an evenly spaced grid with its center at the 0,0 origin
        if (layout == 'grid') {
            var numNodes = _.size(Metamaps.Visualize.mGraph.graph.nodes); // this will always be an integer, the # of nodes on your graph visualization
            var numColumns = Math.floor(Math.sqrt(numNodes)); // the number of columns to make an even grid
            var GRIDSPACE = 400;
            var row = 0;
            var column = 0;
            Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                if (column == numColumns) {
                    column = 0;
                    row += 1;
                }
                var newPos = new $jit.Complex();
                newPos.x = column * GRIDSPACE;
                newPos.y = row * GRIDSPACE;
                n.setPos(newPos, 'end');
                column += 1;
            });
            Metamaps.Visualize.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);
        } else if (layout == 'grid_full') {

            // this will always be an integer, the # of nodes on your graph visualization
            var numNodes = _.size(Metamaps.Visualize.mGraph.graph.nodes);
            //var numColumns = Math.floor(Math.sqrt(numNodes)); // the number of columns to make an even grid
            //var GRIDSPACE = 400;
            var height = Metamaps.Visualize.mGraph.canvas.getSize(0).height;
            var width = Metamaps.Visualize.mGraph.canvas.getSize(0).width;
            var totalArea = height * width;
            var cellArea = totalArea / numNodes;
            var ratio = height / width;
            var cellWidth = sqrt(cellArea / ratio);
            var cellHeight = cellArea / cellWidth;
            var row = floor(height / cellHeight);
            var column = floor(width / cellWidth);
            var totalCells = row * column;

            if (totalCells)
                Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                    if (column == numColumns) {
                        column = 0;
                        row += 1;
                    }
                    var newPos = new $jit.Complex();
                    newPos.x = column * GRIDSPACE;
                    newPos.y = row * GRIDSPACE;
                    n.setPos(newPos, 'end');
                    column += 1;
                });
            Metamaps.Visualize.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);
        } else if (layout == 'radial') {

            var centerX = centerNode.getPos().x;
            var centerY = centerNode.getPos().y;
            centerNode.setPos(centerNode.getPos(), 'end');

            console.log(centerNode.adjacencies);
            var lineLength = 200;
            var usedNodes = {};
            usedNodes[centerNode.id] = centerNode;
            var radial = function (node, level, degree) {
                if (level == 1) {
                    var numLinksTemp = _.size(node.adjacencies);
                    var angleTemp = 2 * Math.PI / numLinksTemp;
                } else {
                    angleTemp = 2 * Math.PI / 20
                };
                node.eachAdjacency(function (a) {
                    var isSecondLevelNode = (centerNode.adjacencies[a.nodeTo.id] != undefined && level > 1);
                    if (usedNodes[a.nodeTo.id] == undefined && !isSecondLevelNode) {
                        var newPos = new $jit.Complex();
                        newPos.x = level * lineLength * Math.sin(degree) + centerX;
                        newPos.y = level * lineLength * Math.cos(degree) + centerY;
                        a.nodeTo.setPos(newPos, 'end');
                        usedNodes[a.nodeTo.id] = a.nodeTo;

                        radial(a.nodeTo, level + 1, degree);
                        degree += angleTemp;
                    };
                });
            };
            radial(centerNode, 1, 0);
            Metamaps.Visualize.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);

        } else if (layout == 'center_viewport') {

            var lowX = 0,
                lowY = 0,
                highX = 0,
                highY = 0;
            var oldOriginX = Metamaps.Visualize.mGraph.canvas.translateOffsetX;
            var oldOriginY = Metamaps.Visualize.mGraph.canvas.translateOffsetY;

            Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                if (n.id === 1) {
                    lowX = n.getPos().x;
                    lowY = n.getPos().y;
                    highX = n.getPos().x;
                    highY = n.getPos().y;
                };
                if (n.getPos().x < lowX) lowX = n.getPos().x;
                if (n.getPos().y < lowY) lowY = n.getPos().y;
                if (n.getPos().x > highX) highX = n.getPos().x;
                if (n.getPos().y > highY) highY = n.getPos().y;
            });
            console.log(lowX, lowY, highX, highY);
            var newOriginX = (lowX + highX) / 2;
            var newOriginY = (lowY + highY) / 2;

        } else alert('please call function with a valid layout dammit!');
    }
}; // end Metamaps.Organize


/*
 *
 *   TOPIC
 *
 */
Metamaps.Topic = {
    // this function is to retrieve a topic JSON object from the database
    // @param id = the id of the topic to retrieve
    get: function (id, callback) {
        // if the desired topic is not yet in the local topic repository, fetch it
        if (Metamaps.Topics.get(id) == undefined) {
            //console.log("Ajax call!");
            if (!callback) {
                var e = $.ajax({
                    url: "/topics/" + id + ".json",
                    async: false
                });
                Metamaps.Topics.add($.parseJSON(e.responseText));
                return Metamaps.Topics.get(id);
            } else {
                return $.ajax({
                    url: "/topics/" + id + ".json",
                    success: function (data) {
                        Metamaps.Topics.add(data);
                        callback(Metamaps.Topics.get(id));
                    }
                });
            }
        } else {
            if (!callback) {
                return Metamaps.Topics.get(id);
            } else {
                return callback(Metamaps.Topics.get(id));
            }
        }
    },
    launch: function (id) {
        var bb = Metamaps.Backbone;
        var start = function (data) {
            Metamaps.Active.Topic = new bb.Topic(data.topic);
            Metamaps.Topics = new bb.TopicCollection([data.topic].concat(data.relatives));
            Metamaps.Synapses = new bb.SynapseCollection(data.synapses);
            Metamaps.Backbone.attachCollectionEvents();

            // build and render the visualization
            Metamaps.Visualize.type = "RGraph";
            Metamaps.JIT.prepareVizData();

            // update filters
            Metamaps.Filter.reset(); 
            Metamaps.Filter.initializeFilterData(); // this sets all the visible filters to true

            // these three update the actual filter box with the right list items
            Metamaps.Filter.checkMetacodes();
            Metamaps.Filter.checkSynapses();
            Metamaps.Filter.checkMappers();
        }

        $.ajax({
            url: "/topics/" + id + "/network.json",
            success: start
        });
    },
    end: function () {
        if (Metamaps.Active.Topic) {
            $('.rightclickmenu').remove();
            Metamaps.TopicCard.hideCard();
            Metamaps.SynapseCard.hideCard();
        }
    },
    /*
     *
     *
     */
    renderTopic: function (mapping, topic, createNewInDB) {
        var self = Metamaps.Topic;

        var nodeOnViz, tempPos;

        var newnode = topic.createNode();

        if (!$.isEmptyObject(Metamaps.Visualize.mGraph.graph.nodes)) {
            Metamaps.Visualize.mGraph.graph.addNode(newnode);
            Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                n.setData("dim", 25, "start");
                n.setData("dim", 25, "end");
            });
            nodeOnViz = Metamaps.Visualize.mGraph.graph.getNode(newnode.id);
            topic.set('node', nodeOnViz);
            topic.updateNode(); // links the topic and the mapping to the node    


            nodeOnViz.setData("dim", 1, "start");
            nodeOnViz.setData("dim", 25, "end");
            if (Metamaps.Visualize.type === "RGraph") {
                tempPos = new $jit.Complex(mapping.get('xloc'), mapping.get('yloc'));
                tempPos = tempPos.toPolar();
                nodeOnViz.setPos(tempPos, "current");
                nodeOnViz.setPos(tempPos, "start");
                nodeOnViz.setPos(tempPos, "end");
            } else if (Metamaps.Visualize.type === "ForceDirected") {
                nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), "current");
                nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), "start");
                nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), "end");
            }
            if (Metamaps.Create.newTopic.addSynapse) {
                Metamaps.Create.newSynapse.topic1id = tempNode.id;
                Metamaps.Create.newSynapse.topic2id = nodeOnViz.id;
                Metamaps.Create.newSynapse.open();
                Metamaps.Visualize.mGraph.fx.animate({
                    modes: ["node-property:dim"],
                    duration: 500,
                    onComplete: function () {
                        tempNode = null;
                        tempNode2 = null;
                        tempInit = false;
                    }
                });
            } else {
                Metamaps.Visualize.mGraph.fx.plotNode(nodeOnViz, Metamaps.Visualize.mGraph.canvas);
                Metamaps.Visualize.mGraph.fx.animate({
                    modes: ["node-property:dim"],
                    duration: 500,
                    onComplete: function () {

                    }
                });
            }
        } else {
            Metamaps.Visualize.mGraph.loadJSON(newnode);
            nodeOnViz = Metamaps.Visualize.mGraph.graph.getNode(newnode.id);
            topic.set('node', nodeOnViz);
            topic.updateNode(); // links the topic and the mapping to the node 

            nodeOnViz.setData("dim", 1, "start");
            nodeOnViz.setData("dim", 25, "end");
            nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), "current");
            nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), "start");
            nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), "end");
            Metamaps.Visualize.mGraph.fx.plotNode(nodeOnViz, Metamaps.Visualize.mGraph.canvas);
            Metamaps.Visualize.mGraph.fx.animate({
                modes: ["node-property:dim"],
                duration: 500,
                onComplete: function () {

                }
            });
        }

        if (!Metamaps.Settings.sandbox && createNewInDB) {
            if (topic.isNew()) {
                topic.save(null, {
                    success: function (topicModel, response) {
                        if (Metamaps.Active.Map) {
                            mapping.save({ topic_id: topicModel.id });
                        }
                    },
                    error: function (model, response) {
                        console.log('error saving topic to database');
                    }
                });
            } else if (!topic.isNew() && Metamaps.Active.Map) {
                mapping.save();
            }
        }
    },
    createTopicLocally: function () {
        var self = Metamaps.Topic;

        var metacode = Metamaps.Metacodes.findWhere({
            name: Metamaps.Create.newTopic.metacode
        });

        var topic = new Metamaps.Backbone.Topic({
            name: Metamaps.Create.newTopic.name,
            metacode_id: metacode.id
        });
        Metamaps.Topics.add(topic);

        var mapping = new Metamaps.Backbone.Mapping({
            category: "Topic",
            xloc: Metamaps.Create.newTopic.x,
            yloc: Metamaps.Create.newTopic.y,
            topic_id: topic.cid
        });
        Metamaps.Mappings.add(mapping);

        //these can't happen until the value is retrieved, which happens in the line above
        Metamaps.Create.newTopic.hide();

        self.renderTopic(mapping, topic, true); // this function also includes the creation of the topic in the database
    },
    getTopicFromAutocomplete: function (id) {
        var self = Metamaps.Topic;

        Metamaps.Create.newTopic.hide();

        var topic = self.get(id);

        var mapping = new Metamaps.Backbone.Mapping({
            category: "Topic",
            xloc: Metamaps.Create.newTopic.x,
            yloc: Metamaps.Create.newTopic.y,
            topic_id: topic.id
        });
        Metamaps.Mappings.add(mapping);

        self.renderTopic(mapping, topic, true);
    }
}; // end Metamaps.Topic


/*
 *
 *   SYNAPSE
 *
 */
Metamaps.Synapse = {
    // this function is to retrieve a synapse JSON object from the database
    // @param id = the id of the synapse to retrieve
    get: function (id, callback) {
        // if the desired topic is not yet in the local topic repository, fetch it
        if (Metamaps.Synapses.get(id) == undefined) {
            if (!callback) {
                var e = $.ajax({
                    url: "/synapses/" + id + ".json",
                    async: false
                });
                Metamaps.Synapses.add($.parseJSON(e.responseText));
                return Metamaps.Synapses.get(id);
            } else {
                return $.ajax({
                    url: "/synapses/" + id + ".json",
                    success: function (data) {
                        Metamaps.Synapses.add(data);
                        callback(Metamaps.Synapses.get(id));
                    }
                });
            }
        } else {
            if (!callback) {
                return Metamaps.Synapses.get(id);
            } else {
                return callback(Metamaps.Synapses.get(id));
            }
        }
    },
    /*
     *
     *
     */
    renderSynapse: function (mapping, synapse, node1, node2, createNewInDB) {
        var self = Metamaps.Synapse;

        var edgeOnViz;

        var newedge = synapse.createEdge();

        Metamaps.Visualize.mGraph.graph.addAdjacence(node1, node2, newedge.data);
        edgeOnViz = Metamaps.Visualize.mGraph.graph.getAdjacence(node1.id, node2.id);
        synapse.set('edge', edgeOnViz);
        synapse.updateEdge(); // links the topic and the mapping to the node 

        Metamaps.Visualize.mGraph.fx.plotLine(edgeOnViz, Metamaps.Visualize.mGraph.canvas);
        Metamaps.Control.selectEdge(edgeOnViz);

        if (!Metamaps.Settings.sandbox && createNewInDB) {
            if (synapse.isNew()) {
                synapse.save(null, {
                    success: function (synapseModel, response) {
                        if (Metamaps.Active.Map) {
                            mapping.save({ synapse_id: synapseModel.id });
                        }
                    },
                    error: function (model, response) {
                        console.log('error saving synapse to database');
                    }
                });
            } else if (!synapse.isNew() && Metamaps.Active.Map) {
                mapping.save();
            }
        }
    },
    createSynapseLocally: function () {
        var self = Metamaps.Synapse,
            topic1,
            topic2,
            node1,
            node2,
            synapse,
            mapping;

        //for each node in this array we will create a synapse going to the position2 node.
        var synapsesToCreate = [];

        node2 = Metamaps.Visualize.mGraph.graph.getNode(Metamaps.Create.newSynapse.topic2id);
        topic2 = node2.getData('topic');

        var len = Metamaps.Selected.Nodes.length;
        if (len == 0) {
            synapsesToCreate[0] = Metamaps.Visualize.mGraph.graph.getNode(Metamaps.Create.newSynapse.topic1id);
        } else if (len > 0) {
            synapsesToCreate = Metamaps.Selected.Nodes;
        }

        for (var i = 0; i < synapsesToCreate.length; i++) {
            node1 = synapsesToCreate[i];
            topic1 = node1.getData('topic');
            synapse = new Metamaps.Backbone.Synapse({
                desc: Metamaps.Create.newSynapse.description,
                node1_id: topic1.isNew() ? topic1.cid : topic1.id,
                node2_id: topic2.isNew() ? topic2.cid : topic2.id,
            });
            Metamaps.Synapses.add(synapse);

            mapping = new Metamaps.Backbone.Mapping({
                category: "Synapse",
                synapse_id: synapse.cid
            });
            Metamaps.Mappings.add(mapping);

            // this function also includes the creation of the synapse in the database
            self.renderSynapse(mapping, synapse, node1, node2, true);
        } // for each in synapsesToCreate

        Metamaps.Create.newSynapse.hide();
    },
    getSynapseFromAutocomplete: function (id) {
        var self = Metamaps.Synapse,
            node1,
            node2;

        var synapse = self.get(id);

        var mapping = new Metamaps.Backbone.Mapping({
            category: "Synapse",
            synapse_id: synapse.id
        });
        Metamaps.Mappings.add(mapping);

        node1 = Metamaps.Visualize.mGraph.graph.getNode(Metamaps.Create.newSynapse.topic1id);
        node2 = Metamaps.Visualize.mGraph.graph.getNode(Metamaps.Create.newSynapse.topic2id);
        Metamaps.Create.newSynapse.hide();

        self.renderSynapse(mapping, synapse, node1, node2, true);
    }
}; // end Metamaps.Synapse


/*
 *
 *   MAP
 *
 */
Metamaps.Map = {
    init: function () {
        var self = Metamaps.Map;

        // prevent right clicks on the main canvas, so as to not get in the way of our right clicks
        $('#center-container').bind('contextmenu', function (e) {
            return false;
        });

        $('.sidebarFork').click(function () {
            self.fork();
        });

        Metamaps.GlobalUI.CreateMap.emptyForkMapForm = $('#fork_map').html();

        self.InfoBox.init();
        self.CheatSheet.init();
    },
    launch: function (id) {
        var bb = Metamaps.Backbone;
        var start = function (data) {
            Metamaps.Active.Map = new bb.Map(data.map);
            Metamaps.Mappers = new bb.MapperCollection(data.mappers);
            Metamaps.Topics = new bb.TopicCollection(data.topics);
            Metamaps.Synapses = new bb.SynapseCollection(data.synapses);
            Metamaps.Mappings = new bb.MappingCollection(data.mappings);
            Metamaps.Backbone.attachCollectionEvents();

            // build and render the visualization
            Metamaps.Visualize.type = "ForceDirected";
            Metamaps.JIT.prepareVizData();

            // update filters
            Metamaps.Filter.reset(); 
            Metamaps.Filter.initializeFilterData(); // this sets all the visible filters to true

            // set the proper mapinfobox content
            Metamaps.Map.InfoBox.load();

            // these three update the actual filter box with the right list items
            Metamaps.Filter.checkMetacodes();
            Metamaps.Filter.checkSynapses();
            Metamaps.Filter.checkMappers();

            Metamaps.Realtime.startActiveMap();
        }

        $.ajax({
            url: "/maps/" + id + "/contains.json",
            success: start
        });
    },
    end: function () {
        if (Metamaps.Active.Map) {
            $('.rightclickmenu').remove();
            Metamaps.TopicCard.hideCard();
            Metamaps.SynapseCard.hideCard();
            Metamaps.Create.newTopic.hide();
            Metamaps.Create.newSynapse.hide();
            Metamaps.Realtime.endActiveMap();
        }
    },
    fork: function () {
        Metamaps.GlobalUI.openLightbox('forkmap');

        var nodes_data = "",
            synapses_data = "";
        var synapses_array = new Array();
        Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
            //don't add to the map if it was filtered out
            // TODO
            //if (categoryVisible[n.getData('metacode')] == false) {
            //    return;
            //}

            var x, y;
            if (n.pos.x && n.pos.y) {
                x = n.pos.x;
                y = n.pos.y;
            } else {
                var x = Math.cos(n.pos.theta) * n.pos.rho;
                var y = Math.sin(n.pos.theta) * n.pos.rho;
            }
            nodes_data += n.id + '/' + x + '/' + y + ',';
            n.eachAdjacency(function (adj) {
                synapses_array.push(adj.getData("synapses")[0].id); // TODO
            });
        });

        //get unique values only
        synapses_array = $.grep(synapses_array, function (value, key) {
            return $.inArray(value, synapses_array) === key;
        });

        synapses_data = synapses_array.join();
        nodes_data = nodes_data.slice(0, -1);

        Metamaps.GlobalUI.CreateMap.topicsToMap = nodes_data;
        Metamaps.GlobalUI.CreateMap.synapsesToMap = synapses_data;
    }
};


/*
 *
 *   CHEATSHEET
 *
 */
Metamaps.Map.CheatSheet = {
    init: function () {
        // tab the cheatsheet
        $('#cheatSheet').tabs();
        $('#quickReference').tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
        $("#quickReference .ui-tabs-nav li").removeClass("ui-corner-top").addClass("ui-corner-left");
        
        // id = the id of a vimeo video
        var switchVideo = function (element, id) {
            $('.tutorialItem').removeClass("active");
            $(element).addClass("active");
            $('#tutorialVideo').attr('src','//player.vimeo.com/video/'+id);
        };

        $('#gettingStarted').click(function() {
            switchVideo(this,'88334167');
        });
        $('#upYourSkillz').click(function() {
            switchVideo(this,'100118167');
        });
        $('#advancedMapping').click(function() {
            switchVideo(this,'88334167');
        });
    }
}; // end Metamaps.Map.CheatSheet


/*
 *
 *   INFOBOX
 *
 */
Metamaps.Map.InfoBox = {
    isOpen: false,
    changing: false,
    selectingPermission: false,
    changePermissionText: "<div class='tip'>As the creator, you can change the permission of this map, but the permissions of the topics and synapses on it must be changed independently.</div>",
    nameHTML: '<span class="best_in_place best_in_place_name" id="best_in_place_map_{{id}}_name" data-url="/maps/{{id}}" data-object="map" data-attribute="name" data-type="input">{{name}}</span>',
    descHTML: '<span class="best_in_place best_in_place_desc" id="best_in_place_map_{{id}}_desc" data-url="/maps/{{id}}" data-object="map" data-attribute="desc" data-nil="Click to add description." data-type="textarea">{{desc}}</span>',
    deleteHTML: "<a href='/maps/{{id}}' class='delete' data-bypass='true' data-confirm='Delete this map (nodes and synapses will remain)?' data-method='delete' rel='nofollow'>Delete</a>",
    init: function () {
        var self = Metamaps.Map.InfoBox;

        $('.mapInfoIcon').click(self.toggleBox);
        $('.mapInfoBox').click(function(event){ 
            event.stopPropagation();
        });
        $('body').click(self.close);

        self.attachEventListeners();

        self.generateBoxHTML = Hogan.compile($('#mapInfoBoxTemplate').html());
    },
    toggleBox: function (event) {
        var self = Metamaps.Map.InfoBox;

        if (self.isOpen) self.close();
        else self.open();

        event.stopPropagation();
    },
    open: function () {
        var self = Metamaps.Map.InfoBox;

        if (!self.isOpen && !self.changing) {
            self.changing = true;
            $('.mapInfoBox').fadeIn(200, function () {
                self.changing = false;
                self.isOpen = true;
            });
        }
    },
    close: function () {
        var self = Metamaps.Map.InfoBox;

        if (!self.changing) {
            self.changing = true;
            $('.mapInfoBox').fadeOut(200, function () {
                self.changing = false;
                self.isOpen = false;
            });
        }
    },
    load: function () {
        var self = Metamaps.Map.InfoBox;

        var map = Metamaps.Active.Map;

        var obj = map.pick("permission","contributor_count","topic_count","synapse_count","created_at","updated_at");

        var isCreator = map.authorizePermissionChange(Metamaps.Active.Mapper);
        var canEdit = map.authorizeToEdit(Metamaps.Active.Mapper);

        obj["name"] = canEdit ? Hogan.compile(self.nameHTML).render({id: map.id, name: map.get("name")}) : map.get("name");
        obj["desc"] = canEdit ? Hogan.compile(self.descHTML).render({id: map.id, desc: map.get("desc")}) : map.get("desc");
        obj["map_creator_tip"] = isCreator ? self.changePermissionText : "";
        obj["delete"] = isCreator ? Hogan.compile(self.deleteHTML).render({id: map.id}) : "";
        obj["contributor_list"] = self.createContributorList();
        obj["user_name"] = isCreator ? "you" : map.get("user_name");

        var classes = isCreator ? "yourMap" : "";
        classes += canEdit ? " canEdit" : "";
        $(".mapInfoBox").removeClass("yourMap canEdit")
            .addClass(classes)
            .html(self.generateBoxHTML.render(obj));

        self.attachEventListeners();
    },
    attachEventListeners: function () {
        var self = Metamaps.Map.InfoBox;

        $('.mapInfoBox .best_in_place').best_in_place();

        // because anyone who can edit the map can change the map title
        $('.mapInfoName .best_in_place_name').unbind("ajax:success").bind("ajax:success", function () {
            var name = $(this).html();
            $('.mapName').html(name);
            Metamaps.Active.Map.set('name', name);
        });

        $('.yourMap .mapPermission').unbind().click(self.onPermissionClick);

    },
    createContributorList: function () {
        var self = Metamaps.Map.InfoBox;

        var mapperNames = Metamaps.Mappers.pluck("name");

        return mapperNames.length > 0 ? mapperNames.join(", ") : "No one has added anything yet.";
    },
    updateNumbers: function () {
        var self = Metamaps.Map.InfoBox;
        var mapper = Metamaps.Active.Mapper;

        if (mapper && Metamaps.Mappers.get(mapper.id) === undefined) {
            Metamaps.Mappers.add(mapper); 
        }
        $('.mapContributors').text(Metamaps.Mappers.length)
            .append('<div class="tip">' + self.createContributorList() + '</div>');
        $('.mapTopics').text(Metamaps.Topics.length);
        $('.mapSynapses').text(Metamaps.Synapses.length);

        $('.mapEditedAt').html('Last edited ' + Metamaps.Util.nowDateFormatted());
    },
    onPermissionClick: function () {
        var self = Metamaps.Map.InfoBox;

        if (!self.selectingPermission) {
            self.selectingPermission = true;
            $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
            if ($(this).hasClass('commons')) {
                $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>');
            } else if ($(this).hasClass('public')) {
                $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>');
            } else if ($(this).hasClass('private')) {
                $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>');
            }
            $('.mapPermission .permissionSelect li').click(self.selectPermission);
        } else {
            self.selectingPermission = false;
            $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
            $('.mapPermission .permissionSelect').remove();
        }
    },
    selectPermission: function () {
        var self = Metamaps.Map.InfoBox;

        self.selectingPermission = false;
        var permission = $(this).attr('class');
        Metamaps.Active.Map.save({
            permission: permission
        });
        $('.mapPermission').removeClass('commons public private minimize').addClass(permission);
        $('.mapPermission .permissionSelect').remove();
        event.stopPropagation();
    }
}; // end Metamaps.Map.InfoBox

/*
*
* Account Settings
*
*/
Metamaps.Account = {
    init: function () {
        var self = Metamaps.Account;

        
    },
    changeName: function(){
        $('.accountName').hide();
        $('.changeName').show();
    },
    showPass: function(){
        $(".toHide").show();
        $(".changePass").hide();
    },
    hidePass: function(){
        $(".toHide").hide();
        $(".changePass").show();

        $('#current_password').val('');
        $('#user_password').val('');
        $('#user_password_confirmation').val('');
    }
};

/*
 *
 *   MAPPER
 *
 */
Metamaps.Mapper = {
    // this function is to retrieve a mapper JSON object from the database
    // @param id = the id of the mapper to retrieve
    get: function (id, callback) {
        return $.ajax({
            url: "/users/" + id + ".json",
            success: function (data) {
                callback(new Metamaps.Backbone.Mapper(data));
            }
        });
    }
}; // end Metamaps.Mapper


/*
 *
 *   ADMIN
 *
 */

Metamaps.Admin = {
    selectMetacodes: [],
    allMetacodes: [],
    init: function () {
        var self = Metamaps.Admin;

        $('#metacodes_value').val(self.selectMetacodes.toString());
    },
    selectAll: function () {
        var self = Metamaps.Admin; 

        $('.editMetacodes li').removeClass('toggledOff');
        self.selectMetacodes = self.allMetacodes.slice(0);
        $('#metacodes_value').val(self.selectMetacodes.toString());
    },
    deselectAll: function () {
        var self = Metamaps.Admin; 

        $('.editMetacodes li').addClass('toggledOff');
        self.selectMetacodes = [];
        $('#metacodes_value').val(0);
    },
    liClickHandler: function () {
        var self = Metamaps.Admin;

        if ($(this).attr('class') != 'toggledOff') {
          $(this).addClass('toggledOff');
          var value_to_remove = $(this).attr('id');
          self.selectMetacodes.splice(self.selectMetacodes.indexOf(value_to_remove), 1);
          $('#metacodes_value').val(self.selectMetacodes.toString());
        }
        else if ($(this).attr('class') == 'toggledOff') {
          $(this).removeClass('toggledOff');
          self.selectMetacodes.push($(this).attr('id'));
          $('#metacodes_value').val(self.selectMetacodes.toString());
        }
    },
    validate: function () {
        var self = Metamaps.Admin;

        if (self.selectMetacodes.length == 0) {
          alert('Would you pretty please select at least one metacode for the set?');
          return false;
        }
    }
};

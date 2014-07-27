var Metamaps = {}; // this variable declaration defines a Javascript object that will contain all the variables and functions used by us, broken down into 'sub-modules' that look something like this

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

var panningInt; // this variable is used to store a 'setInterval' for the Metamaps.JIT.SmoothPanning() function, so that it can be cleared with window.clearInterval
var tempNode = null,
    tempInit = false,
    tempNode2 = null;

$(document).ready(function () {

    _.templateSettings = {
        interpolate: /{{(.+?)}}/g
    };

    for (var prop in Metamaps) {
        if (Metamaps.hasOwnProperty(prop) &&
            Metamaps[prop].hasOwnProperty('init') &&
            typeof (Metamaps[prop].init) == 'function'
        ) {
            Metamaps[prop].init();
        }
    }

    Metamaps.JIT.prepareVizData();
});

Metamaps.Settings = {
    realtime: false, // indicates whether the user wants to be playing in the app with realtime updates to their topics
    embed: false, // indicates that the app is on a page that is optimized for embedding in iFrames on other web pages
    sandbox: false, // puts the app into a mode (when true) where it only creates data locally, and isn't writing it to the database
    selectedMetacodeSet: null, // will get initialized
    selectedMetacodeSetIndex: null, // will get initialized
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

// only one of these will be active at a time
// Map if you're on a map page
// Topic if you're on a topic page
Metamaps.Active = {
    Map: null,
    Topic: null
};

Metamaps.Backbone = {
    init: function () {
        var self = Metamaps.Backbone;

        self.Metacode = Backbone.Model.extend({});
        self.MetacodeCollection = Backbone.Collection.extend({
            model: this.Metacode,
            url: '/metacodes'
        });

        self.Topic = Backbone.Model.extend({
            urlRoot: '/topics',
            blacklist: ['mappings'],
            toJSON: function (options) {
                return _.omit(this.attributes, this.blacklist);
            },
            initialize: function () {
                if (this.isNew()) {
                    this.set({
                        "user_id": Metamaps.Active.Mapper.id,
                        "desc": '',
                        "link": '',
                        "permission": Metamaps.Active.Map ? Metamaps.Active.Map.get('permission') : 'commons',
                        "mappings": []
                    });
                }
            },
            authorizeToEdit: function (mapper) {
                if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
                else return false;
            },
            authorizePermissionChange: function (mapper) {
                if (mapper && this.get('user_id') === mapper.get('id')) return true;
                else return false;
            },
            updateMappings: function () {
                var mappings = this.get('mappings'),
                    l = mappings.length,
                    i;

                for (i = 0; i < l; i++) {
                    mappings[i].set('topic_id', this.id);
                    if (!mappings[i].isNew()) mappings[i].save();
                }
            },
            getDate: function () {

            },
            getUser: function () {
                return Metamaps.Mapper.get(this.get('user_id'));
            },
            getMetacode: function () {
                return Metamaps.Metacodes.get(this.get('metacode_id'));
            }
        });

        self.TopicCollection = Backbone.Collection.extend({
            model: self.Topic,
            url: '/topics',
            comparator: function (a, b) {
                a = a.get('name').toLowerCase();
                b = b.get('name').toLowerCase();
                return a > b ? 1 : a < b ? -1 : 0;
            }
        });

        self.Synapse = Backbone.Model.extend({
            urlRoot: '/synapses',
            initialize: function () {
                if (this.isNew()) {
                    this.set({
                        "user_id": Metamaps.Active.Mapper.id,
                        "permission": Metamaps.Active.Map.get('permission'),
                        "category": "from-to"
                    });
                }
            },
            authorizeToEdit: function (mapper) {
                if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
                else return false;
            },
            authorizePermissionChange: function (mapper) {
                if (mapper && this.get('user_id') === mapper.get('id')) return true;
                else return false;
            },
            updateMappings: function () {
                var mappings = this.get('mappings'),
                    l = mappings.length,
                    i;

                for (i = 0; i < l; i++) {
                    mappings[i].set('synapse_id', this.id);
                    if (!mappings[i].isNew()) mappings[i].save();
                }
            },
            getUser: function () {
                return Metamaps.Mapper.get(this.get('user_id'));
            },
            getTopic1: function () {
                return Metamaps.Topic.get(this.get('node1_id'));
            },
            getTopic2: function () {
                return Metamaps.Topic.get(this.get('node2_id'));
            },
            getDirection: function () {
                var mapping1 = this.getTopic1().get('mappings')[0],
                    mapping2 = this.getTopic2().get('mappings')[0];
                return [
                    mapping1.isNew() ? mapping1.cid : mapping1.id,
                    mapping2.isNew() ? mapping2.cid : mapping2.id
                ];   
            }
        });

        self.SynapseCollection = Backbone.Collection.extend({
            model: self.Synapse,
            url: '/synapses'
        });

        self.Mapping = Backbone.Model.extend({
            urlRoot: '/mappings',
            blacklist: ['node', 'edge'],
            toJSON: function (options) {
                return _.omit(this.attributes, this.blacklist);
            },
            initialize: function () {
                var topic = this.getTopic(),
                    synapse = this.getSynapse();
                
                if (this.isNew()) {
                    this.set({
                        "user_id": Metamaps.Active.Mapper.id,
                        "map_id": Metamaps.Active.Map ? Metamaps.Active.Map.id : null
                    });
                }
                
                if (topic) topic.set('mappings', [this]);
                else if (synapse) synapse.set('mappings', [this]);
            },
            getUser: function () {
                return Metamaps.Mapper.get(this.get('user_id'));
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
            },
            createNode: function () {
                var topic = this.getTopic();
                if (topic) {
                    var node = {
                        id: this.isNew() ? this.cid : this.id,
                        name: topic.get('name')
                    };
                    return node;
                } else return false;
            },
            updateNode: function () {
                var topic = this.getTopic();
                if (topic) {
                    var node = this.get('node');
                    node.setData('topic', topic);
                    node.setData('mapping', this);
                    node.id = this.isNew() ? this.cid : this.id;
                    return node;
                } else return false;
            },
            createEdge: function () {
                var synapse = this.getSynapse();
                if (synapse) {
                    var edge = {
                        nodeFrom: synapse.getTopic1().get('mappings')[0].id,
                        nodeTo: synapse.getTopic2().get('mappings')[0].id,
                        data: {
                            $synapses: [],
                            $mappings: []
                        }
                    };
                    return edge;
                } else return false;
            },
            updateEdge: function () {
                var synapse = this.getSynapse();
                if (synapse) {
                    var edge = this.get('edge');
                    
                    edge.getData('synapses').push(synapse);
                    edge.getData('mappings').push(this);
                    return edge;
                } else return false;
            },
        });

        self.MappingCollection = Backbone.Collection.extend({
            model: self.Mapping,
            url: '/mappings'
        });

        self.Map = Backbone.Model.extend({
            urlRoot: '/maps',
            authorizeToEdit: function (mapper) {
                if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
                else return false;
            }
        });
        self.MapsCollection = Backbone.Collection.extend({
            model: self.Map,
            url: '/maps'
        });

        self.Mapper = Backbone.Model.extend({
            urlRoot: '/users'
        });
        self.MapperCollection = Backbone.Collection.extend({
            model: self.Mapper,
            url: '/users'
        });

        Metamaps.Metacodes = new self.MetacodeCollection(Metamaps.Metacodes);

        Metamaps.Active.Mapper = new self.Mapper({
            id: userid,
            name: username
        });
        Metamaps.Mappers = new self.MapperCollection([Metamaps.Active.Mapper]);

        Metamaps.Topics = new self.TopicCollection(Metamaps.Topics);

        Metamaps.Synapses = new self.SynapseCollection(Metamaps.Synapses);

        Metamaps.Mappings = new self.MappingCollection(Metamaps.Mappings);

        Metamaps.Active.Map = new self.Map(Metamaps.Active.Map);
        Metamaps.Maps = new self.MapsCollection([Metamaps.Active.Map]);
    }
};


Metamaps.Control = {
    init: function () {

    },
    selectNode: function (node) {
        if (Metamaps.Selected.Topics.indexOf(node) != -1) return;
        node.selected = true;
        node.setData('dim', 30, 'current');
        node.eachAdjacency(function (adj) {
            Metamaps.Control.selectEdge(adj);
        });
        Metamaps.Selected.Topics.push(node);
    },
    deselectAllNodes: function () {
        var l = Metamaps.Selected.Topics.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var node = Metamaps.Selected.Topics[i];
            Metamaps.Control.deselectNode(node);
        }
        Metamaps.Visualize.mGraph.plot();
    },
    deselectNode: function (node) {
        delete node.selected;
        node.eachAdjacency(function (adj) {
            Metamaps.Control.deselectEdge(adj);
        });
        node.setData('dim', 25, 'current');

        //remove the node
        Metamaps.Selected.Topics.splice(
            Metamaps.Selected.Topics.indexOf(node), 1);
    },
    deleteSelectedNodes: function () { // refers to deleting topics permanently
        var l = Metamaps.Selected.Topics.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var node = Metamaps.Selected.Topics[i];
            Metamaps.Control.deleteNode(node.id);
        }
    },
    deleteNode: function (nodeid) { // refers to deleting topics permanently
        var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid);
        var id = node.getData('id');
        Metamaps.Control.deselectNode(node);
        Metamaps.Topics.get(id).destroy();
        Metamaps.Control.hideNode(nodeid);
    },
    removeSelectedNodes: function () { // refers to removing topics permanently from a map
        var l = Metamaps.Selected.Topics.length,
            i,
            node,
            mapperm = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper);

        if (mapperm) {
            for (i = l - 1; i >= 0; i -= 1) {
                node = Metamaps.Selected.Topics[i];
                Metamaps.Control.removeNode(node.id);
            }
        }
    },
    removeNode: function (nodeid) { // refers to removing topics permanently from a map
        var mapperm = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper);
        var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid);
        var mappingid = node.getData("mappingid");

        if (mapperm) {
            Metamaps.Control.deselectNode(node);
            Metamaps.Mappings.get(mappingid).destroy();
            Metamaps.Control.hideNode(nodeid);
        }
    },
    hideSelectedNodes: function () {
        var l = Metamaps.Selected.Topics.length,
            i,
            node;

        for (i = l - 1; i >= 0; i -= 1) {
            node = Metamaps.Selected.Topics[i];
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
    },
    selectEdge: function (edge) {
        if (Metamaps.Selected.Synapses.indexOf(edge) != -1) return;
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
        Metamaps.Selected.Synapses.push(edge);
    },
    deselectAllEdges: function () {
        var l = Metamaps.Selected.Synapses.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var edge = Metamaps.Selected.Synapses[i];
            Metamaps.Control.deselectEdge(edge);
        }
        Metamaps.Visualize.mGraph.plot();
    },
    deselectEdge: function (edge) {
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
        Metamaps.Selected.Synapses.splice(
            Metamaps.Selected.Synapses.indexOf(edge), 1);
    },
    deleteSelectedEdges: function () { // refers to deleting topics permanently
        var edge,
            l = Metamaps.Selected.Synapses.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            edge = Metamaps.Selected.Synapses[i];
            Metamaps.Control.deleteEdge(edge);
        }
    },
    deleteEdge: function (edge) {
        var id = edge.getData("id");
        Metamaps.Synapses.get(id).destroy();
        Metamaps.Control.hideEdge(edge);
    },
    removeSelectedEdges: function () {
        var l = Metamaps.Selected.Synapses.length,
            i,
            edge;

        if (Metamaps.Active.Map) {
            for (i = l - 1; i >= 0; i -= 1) {
                edge = Metamaps.Selected.Synapses[i];
                Metamaps.Control.removeEdge(edge);
            }
            Metamaps.Selected.Synapses = new Array();
        }
    },
    removeEdge: function (edge) {
        var mappingid = edge.getData("mappingid");
        Metamaps.Mappings.get(mappingid).destroy();
        Metamaps.Control.hideEdge(edge);
    },
    hideSelectedEdges: function () {
        var edge,
            l = Metamaps.Selected.Synapses.length,
            i;
        for (i = l - 1; i >= 0; i -= 1) {
            edge = Metamaps.Selected.Synapses[i];
            Metamaps.Control.hideEdge(edge);
        }
        Metamaps.Selected.Synapses = new Array();
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
    },
    updateSelectedPermissions: function (permission) {

        // TODO

        if ($('.notice.metamaps').length == 0) {
            $('body').prepend('<div class="notice metamaps" />');
        }
        $('.notice.metamaps').hide().html('Working...').fadeIn('fast');

        // variables to keep track of how many nodes and synapses you had the ability to change the permission of
        var nCount = 0,
            sCount = 0;

        // change the permission of the selected synapses, if logged in user is the original creator
        var l = Metamaps.Selected.Synapses.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var edge = Metamaps.Selected.Synapses[i];

            if (edge.getData('userid') == userid) {
                Metamaps.Control.updateSynapsePermission(edge, permission);
                sCount++;
            }
        }

        // change the permission of the selected topics, if logged in user is the original creator
        var l = Metamaps.Selected.Topics.length;
        for (var i = l - 1; i >= 0; i -= 1) {
            var node = Metamaps.Selected.Topics[i];

            if (node.getData('userid') == userid) {
                Metamaps.Control.updateTopicPermission(node, permission);
                nCount++;
            }
        }

        var nString = nCount == 1 ? (nCount.toString() + ' topic and ') : (nCount.toString() + ' topics and ');
        var sString = sCount == 1 ? (sCount.toString() + ' synapse') : (sCount.toString() + ' synapses');

        $('.notice.metamaps').html(nString + sString + ' you created updated to ' + permission)
        setTimeout(function () { // TODO make it so that this can be cancelled by another message which is trying to be shown
            $('.notice.metamaps').fadeOut('fast');
        }, 8000);
    },
    updateTopicPermission: function (node, permission) {
        var mdata = {
            "topic": {
                "permission": permission
            }
        };
        $.ajax({
            type: "PUT",
            dataType: 'json',
            url: "/topics/" + node.id,
            data: mdata,
            success: function (data) {
                $('.showcard .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2));
                $('.permissionSelect').remove();
                node.setData("permission", permission);
            },
            error: function () {
                console.log('failed to update permission');
            }
        });
    },
    updateSynapsePermission: function (edge, permission) {
        var mdata = {
            "synapse": {
                "permission": permission
            }
        };
        $.ajax({
            type: "PUT",
            dataType: 'json',
            url: "/synapses/" + edge.data.$id,
            data: mdata,
            success: function (data) {
                $('#edit_synapse .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2));
                $('#edit_synapse .permissionSelect').remove();
                edge.setData("permission", permission);
            },
            error: function () {
                console.log('failed to update permission');
            }
        });
    },
    updateMapPermission: function (permission) {
        var mdata = {
            "map": {
                "permission": permission
            }
        };
        $.ajax({
            type: "PUT",
            dataType: 'json',
            url: "/maps/" + Metamaps.Active.Map.id,
            data: mdata,
            success: function (data) {
                $('.mapPermission').removeClass('commons public private minimize').addClass(permission);
                $('.mapPermission .permissionSelect').remove();
            },
            error: function () {
                console.log('failed to update permission');
            }
        });
    }
};
Metamaps.Create = {
    init: function () {
        Metamaps.Create.newTopic.init();
        Metamaps.Create.newSynapse.init();
    },
    newTopic: {
        init: function () {
            $('#new_topic').bind('contextmenu', function (e) {
                return false;
            });

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
                xPos: 150,
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

            // keep the right click menu from opening
            $('#new_synapse').bind('contextmenu', function (e) {
                return false;
            });

            $('#synapse_desc').keyup(function () {
                Metamaps.Create.newSynapse.description = $(this).val();
            });

            // initialize the autocomplete results for synapse creation
            $('#synapse_desc').typeahead([
                {
                    name: 'synapse_autocomplete',
                    template: "<div>{{label}}</div>",
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
                            var q = '/search/synapses?topic1id=' + Metamaps.Create.newSynapse.topic1id + '&topic2id=' + Metamaps.Create.newSynapse.topic2id;
                            return q;
                        }
                    },
                    engine: Hogan,
                    header: "<h3>Existing Synapses</h3>"
                      },
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
            Metamaps.Create.newSynapse.beingCreated = false;
            Metamaps.Create.newTopic.addSynapse = false;
            Metamaps.Create.newSynapse.topic1id = 0;
            Metamaps.Create.newSynapse.topic2id = 0;
        }
    }
};
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

    /*
     *
     *
     */
    renderTopic: function (mapping, topic, createNewInDB) {
        var self = Metamaps.Topic;

        var nodeOnViz, tempPos;

        var newnode = mapping.createNode();

        if (!$.isEmptyObject(Metamaps.Visualize.mGraph.graph.nodes)) {
            Metamaps.Visualize.mGraph.graph.addNode(newnode);
            Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                n.setData("dim", 25, "start");
                n.setData("dim", 25, "end");
            });
            nodeOnViz = Metamaps.Visualize.mGraph.graph.getNode(newnode.id);
            mapping.set('node', nodeOnViz);
            mapping.updateNode(); // links the topic and the mapping to the node    


            nodeOnViz.setData("dim", 1, "start");
            nodeOnViz.setData("dim", 40, "end");
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
                Metamaps.Create.newSynapse.beingCreated = true;
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
            mapping.set('node', nodeOnViz);
            mapping.updateNode(); // links the topic and the mapping to the node 

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
                        topicModel.updateMappings();
                        if (Metamaps.Active.Map) {
                            mapping.save();
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
        Metamaps.Create.newTopic.addSynapse = false;

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

        self.renderTopic(mapping, topic, false);
    }
};
Metamaps.TopicCard = {
    openTopicCard: null, //stores the JIT local ID of the topic with the topic card open 
    init: function () {
        //$('.best_in_place').best_in_place();
        Metamaps.TopicCard.generateShowcardHTML = Hogan.compile($('#topicCardTemplate').html());
    },
    fadeInShowCard: function (topic) {
        $('.showcard').fadeIn('fast');
        Metamaps.TopicCard.openTopicCard = topic.isNew() ? topic.cid : topic.id;
    },
    /**
     * Will open the Topic Card for the node that it's passed
     * @param {$jit.Graph.Node} node
     */
    showCard: function (node) {

        var topic = node.getData('topic');

        //populate the card that's about to show with the right topics data
        Metamaps.TopicCard.populateShowCard(topic);
        Metamaps.TopicCard.fadeInShowCard(topic);
    },
    hideCard: function () {
        $('.showcard').fadeOut('fast');
        Metamaps.TopicCard.openTopicCard = null;
    },
    bindShowCardListeners: function (topic) {
        var self = Metamaps.TopicCard;
        var showCard = document.getElementById('showcard');

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

        $('.showcard .metacodeTitle').click(function () {
            if (!selectingMetacode) {
                selectingMetacode = true;
                $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
                $('.metacodeSelect').show();
                // add the scroll bar to the list of metacode select options if it isn't already there
                if (!$('.metacodeSelect ul').hasClass('mCustomScrollbar')) {
                    $('.metacodeSelect ul').mCustomScrollbar({
                        mouseWheelPixels: 200,
                        advanced: {
                            updateOnContentResize: true
                        }
                    });

                    $('.metacodeSelect li').click(function () {
                        selectingMetacode = false;
                        var metacodeName = $(this).find('.mSelectName').text();
                        //updateMetacode(node, metacodeName); //TODO
                    });
                }
            } else {
                selectingMetacode = false;
                $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
                $('.metacodeSelect').hide();
            }
        });


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
                        // Metamaps.Control.updateTopicPermission(node, permission); // TODO
                        event.stopPropagation();
                    });
                } else {
                    selectingPermission = false;
                    $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
                    $('.permissionSelect').remove();
                }
            });
        }

        // when you're typing a description, resize the scroll box to have space
        $('.best_in_place_desc textarea').bind('keyup', function () {
            var s = $('.showcard').find('.scroll');
            s.height(s.height()).mCustomScrollbar('update');
        });

        //bind best_in_place ajax callbacks
        $(showCard).find('.best_in_place_name').bind("ajax:success", function () {

            var s = $('.showcard').find('.scroll');
            s.height(s.height()).mCustomScrollbar('update');

            var name = $(this).html();
            topic.set("name", Metamaps.Util.decodeEntities(name));
            Metamaps.Visualize.mGraph.plot();
        });

        $(showCard).find('.best_in_place_desc').bind("ajax:success", function () {
            this.innerHTML = this.innerHTML.replace(/\r/g, '')

            var s = $('.showcard').find('.scroll');
            s.height(s.height()).mCustomScrollbar('update');

            var desc = $(this).html();
            topic.set("desc", desc);
        });

        $(showCard).find('.best_in_place_link').bind("ajax:success", function () {
            var link = $(this).html();
            $(showCard).find('.go-link').attr('href', link);
            topic.set("link", link);
        });
    },
    populateShowCard: function (topic) {
        var self = Metamaps.TopicCard;

        var showCard = document.getElementById('showcard');

        $(showCard).find('.permission').remove();

        var html = self.generateShowcardHTML.render(self.buildObject(topic));

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
        var nodeValues = {};
        var authorized = topic.authorizeToEdit(Metamaps.Active.Mapper);

        //link is rendered differently if user is logged out or in
        var go_link, a_tag, close_a_tag;
        if (!authorized) {
            go_link = '';
            if (topic.get("link") != "") {
                a_tag = '<a href="' + topic.get("link") + '" target="_blank">';
                close_a_tag = '</a>';
            } else {
                a_tag = '';
                close_a_tag = '';
            }
        } else {
            go_link = '<a href="' + topic.get("link") + '" ' +
                '   class="go-link" target="_blank"></a>';
            a_tag = '';
            close_a_tag = '';
        }

        var desc_nil = "Click to add description...";
        var link_nil = "Click to add link...";

        nodeValues.permission = topic.get("permission");
        nodeValues.mk_permission = topic.get("permission").substring(0, 2);
        //nodeValues.map_count = topic.get("inmaps").length;
        //nodeValues.synapse_count = topic.get("synapseCount");
        nodeValues.id = topic.isNew() ? topic.cid : topic.id;
        nodeValues.metacode = topic.getMetacode().get("name");
        nodeValues.metacode_class = 'mbg' + topic.getMetacode().get("name").replace(/\s/g, '');
        nodeValues.imgsrc = topic.getMetacode().get("icon");
        nodeValues.name = topic.get("name");
        nodeValues.userid = topic.get("user_id");
        nodeValues.username = topic.getUser().get("name");
        nodeValues.date = topic.getDate();

        // the code for this is stored in /views/main/_metacodeOptions.html.erb
        nodeValues.metacode_select = $('#metacodeOptions').html();
        nodeValues.go_link = go_link;
        nodeValues.a_tag = a_tag;
        nodeValues.close_a_tag = close_a_tag;
        nodeValues.link_nil = link_nil;
        nodeValues.link = (topic.get("link") == "" && authorized) ? link_nil : topic.get("link");
        nodeValues.desc_nil = desc_nil;
        nodeValues.desc = (topic.get("desc") == "" && authorized) ? desc_nil : topic.get("desc");
        return nodeValues;
    }
};
Metamaps.Find = {
    filters: {
        name: "",
        type: []
    },
    init: function () {
        $('#filterText').on('input', function () {
            Metamaps.Find.filterText();
        });
    },
    filterText: function () {
        var duration = 500;
        query = $('#filterText').val();
        dim = $('#dim').is(":checked");
        if (dim) {
            alpha = 0.2;
        } else {
            alpha = 0.0;
        }

        Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
            //if node name doesnt matche query
            if (query != "") {
                if (n.name.toLowerCase().indexOf(query.toLowerCase()) === -1) {
                    n.setData('alpha', alpha, 'end');
                    n.eachAdjacency(function (adj) {
                        adj.setData('alpha', alpha, 'end');
                    });
                }
            } else {
                n.setData('alpha', 1.0, 'end');
                n.eachAdjacency(function (adj) {
                    adj.setData('alpha', 1.0, 'end');
                });
            }

        });
        //Metamaps.Visualize.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);   

        Metamaps.Visualize.mGraph.animate({
            modes: ['node-property:alpha',
    'edge-property:alpha'],
            duration: duration
        });
    },
    passFilters: function (topic) {
        var self = Metamaps.Find;
        var filters = self.filters;

        var passesName = filters.name == "" ? true : false,
            passesType = filters.type == [] ? true : false;

        //filter by name
        if (topic.get('1')[1][0].toLowerCase().indexOf(filters.name) !== -1) {
            passesName = true;
        }
        // filter by type
        if (!filters.type == []) {
            // get the array of types that your topic 'is'
            var metacodes = topic.get('2') ? topic.get('2')[1] : [];
            if (_.intersection(filters.type, metacodes).length == 0) passesType = true;
        }

        if (passesName && passesType) {
            return true;
        } else {
            return false;
        }
    }
};
Metamaps.JIT = {
    vizData: [], // contains the visualization-compatible graph
    graphRendered: false, // flag indicates if we have rendered the data so we don't bother doing it again wastefully
    metacodeIMGinit: false,
    /**
     * This method will bind the event handlers it is interested and initialize the class.
     */
    init: function () {
        var self = Metamaps.JIT;


    },
    /**
     * convert our topic JSON into something JIT can use
     */
    prepareVizData: function () {
        var self = Metamaps.JIT;
        var topic;

        Metamaps.Mappings.each(function (m) {
            if (m.get("category") === "Topic") {
                self.vizData.push(m.createNode());
            }
        });

        if (self.vizData.length == 0) {
            Metamaps.Visualize.loadLater = true;
        }

        Metamaps.Visualize.render("infovis", self.vizData);
    }, // prepareVizData
    edgeRender: function (adj, canvas) {
        //get nodes cartesian coordinates 
        var pos = adj.nodeFrom.pos.getc(true);
        var posChild = adj.nodeTo.pos.getc(true);

        var synapse = adj.getData("synapses")[0];  // for now, just grab the first synapse
        
        var directionCat = synapse.get("category");
        
        //label placement on edges 
        Metamaps.JIT.renderEdgeArrows(this.edgeHelper, adj, synapse);

        //check for edge label in data  
        var desc = synapse.get("desc");
        
        var showDesc = adj.getData("showDesc");
        
        if (desc != "" && showDesc) {
            // '&amp;' to '&'
            desc = Metamaps.Util.decodeEntities(desc);

            //now adjust the label placement 
            var ctx = canvas.getCtx();
            ctx.font = 'bold 14px arial';
            ctx.fillStyle = '#FFF';
            ctx.textBaseline = 'hanging';

            var arrayOfLabelLines = Metamaps.Util.splitLine(desc, 30).split('\n');
            var index, lineWidths = [];
            for (index = 0; index < arrayOfLabelLines.length; ++index) {
                lineWidths.push(ctx.measureText(arrayOfLabelLines[index]).width)
            }
            var width = Math.max.apply(null, lineWidths) + 8;
            var height = (16 * arrayOfLabelLines.length) + 8;

            var x = (pos.x + posChild.x - width) / 2;
            var y = ((pos.y + posChild.y) / 2) - height / 2;
            var radius = 5;

            //render background
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();

            //render text
            ctx.fillStyle = '#222222';
            ctx.textAlign = 'center';
            for (index = 0; index < arrayOfLabelLines.length; ++index) {
                ctx.fillText(arrayOfLabelLines[index], x + (width / 2), y + 5 + (16 * index));
            }
        }
    }, // edgeRender
    edgeRenderEmbed: function (adj, canvas) {
        //get nodes cartesian coordinates 
        var pos = adj.nodeFrom.pos.getc(true);
        var posChild = adj.nodeTo.pos.getc(true);

        var directionCat = adj.getData("category");
        //label placement on edges 
        Metamaps.JIT.renderEdgeArrows(this.edgeHelper, adj);

        //check for edge label in data  
        var desc = adj.getData("desc");
        var showDesc = adj.getData("showDesc");
        if (desc != "" && showDesc) {
            // '&amp;' to '&'
            desc = Metamaps.Util.decodeEntities(desc);

            //now adjust the label placement 
            var ctx = canvas.getCtx();
            ctx.font = 'bold 14px arial';
            ctx.fillStyle = '#FFF';
            ctx.textBaseline = 'hanging';

            var arrayOfLabelLines = Metamaps.Util.splitLine(desc, 30).split('\n');
            var index, lineWidths = [];
            for (index = 0; index < arrayOfLabelLines.length; ++index) {
                lineWidths.push(ctx.measureText(arrayOfLabelLines[index]).width)
            }
            var width = Math.max.apply(null, lineWidths) + 8;
            var height = (16 * arrayOfLabelLines.length) + 8;

            var x = (pos.x + posChild.x - width) / 2;
            var y = ((pos.y + posChild.y) / 2) - height / 2;
            var radius = 5;

            //render background
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();

            //render text
            ctx.fillStyle = '#222222';
            ctx.textAlign = 'center';
            for (index = 0; index < arrayOfLabelLines.length; ++index) {
                ctx.fillText(arrayOfLabelLines[index], x + (width / 2), y + 5 + (16 * index));
            }
        }
    }, // edgeRenderEmbed
    ForceDirected: {
        animateSavedLayout: {
            modes: ['linear'],
            transition: $jit.Trans.Quad.easeInOut,
            duration: 800,
            onComplete: function () {
                Metamaps.Visualize.mGraph.busy = false;
            }
        },
        animateFDLayout: {
            modes: ['linear'],
            transition: $jit.Trans.Elastic.easeOut,
            duration: 2500,
            onComplete: function () {
                Metamaps.Visualize.mGraph.busy = false;
            }
        },
        graphSettings: {
            //id of the visualization container
            injectInto: 'infovis',
            //Enable zooming and panning
            //by scrolling and DnD
            Navigation: {
                enable: true,
                //Enable panning events only if we're dragging the empty
                //canvas (and not a node).
                panning: 'avoid nodes',
                zooming: 28 //zoom speed. higher is more sensible
            },
            background: {
                type: 'Metamaps'
            },
            //NodeStyles: {  
            //  enable: true,  
            //  type: 'Native',  
            //  stylesHover: {  
            //    dim: 30  
            //  },  
            //  duration: 300  
            //},
            // Change node and edge styles such as
            // color and width.
            // These properties are also set per node
            // with dollar prefixed data-properties in the
            // JSON structure.
            Node: {
                overridable: true,
                color: '#2D6A5D',
                type: 'customNode',
                dim: 25
            },
            Edge: {
                overridable: true,
                color: Metamaps.Settings.colors.synapses.normal,
                type: 'customEdge',
                lineWidth: 2,
                alpha: 0.4
            },
            //Native canvas text styling
            Label: {
                type: 'Native', //Native or HTML
                size: 20,
                family: 'arial',
                textBaseline: 'hanging',
                color: Metamaps.Settings.colors.labels.text
            },
            //Add Tips
            Tips: {
                enable: false,
                onShow: function (tip, node) {}
            },
            // Add node events
            Events: {
                enable: true,
                enableForEdges: true,
                onMouseMove: function (node, eventInfo, e) {
                    Metamaps.JIT.onMouseMoveHandler(node, eventInfo, e);
                },
                //Update node positions when dragged
                onDragMove: function (node, eventInfo, e) {
                    Metamaps.JIT.onDragMoveTopicHandler(node, eventInfo, e);
                },
                onDragEnd: function (node, eventInfo, e) {
                    Metamaps.JIT.onDragEndTopicHandler(node, eventInfo, e, false);
                },
                onDragCancel: function (node, eventInfo, e) {
                    Metamaps.JIT.onDragCancelHandler(node, eventInfo, e, false);
                },
                //Implement the same handler for touchscreens
                onTouchStart: function (node, eventInfo, e) {
                    //$jit.util.event.stop(e); //stop default touchmove event
                    //Metamaps.Visualize.mGraph.events.onMouseDown(e, null, eventInfo);
                    Metamaps.Visualize.mGraph.events.touched = true;
                    Metamaps.Touch.touchPos = eventInfo.getPos();
                    var canvas = Metamaps.Visualize.mGraph.canvas,
                        ox = canvas.translateOffsetX;
                    oy = canvas.translateOffsetY,
                    sx = canvas.scaleOffsetX,
                    sy = canvas.scaleOffsetY;
                    Metamaps.Touch.touchPos.x *= sx;
                    Metamaps.Touch.touchPos.y *= sy;
                    Metamaps.Touch.touchPos.x += ox;
                    Metamaps.Touch.touchPos.y += oy;

                    touchDragNode = node;
                },
                //Implement the same handler for touchscreens
                onTouchMove: function (node, eventInfo, e) {
                    if (Metamaps.Touch.touchDragNode) Metamaps.JIT.onDragMoveTopicHandler(Metamaps.Touch.touchDragNode, eventInfo, e);
                    else {
                        Metamaps.JIT.touchPanZoomHandler(eventInfo, e);
                    }
                },
                //Implement the same handler for touchscreens
                onTouchEnd: function (node, eventInfo, e) {

                },
                //Implement the same handler for touchscreens
                onTouchCancel: function (node, eventInfo, e) {

                },
                //Add also a click handler to nodes
                onClick: function (node, eventInfo, e) {

                    // remove the rightclickmenu
                    $('.rightclickmenu').remove();

                    if (Metamaps.Mouse.boxStartCoordinates) {
                        Metamaps.Visualize.mGraph.busy = false;
                        Metamaps.Mouse.boxEndCoordinates = eventInfo.getPos();
                        Metamaps.JIT.selectNodesWithBox();
                        return;
                    }

                    if (e.target.id != "infovis-canvas") return false;

                    //clicking on a edge, node, or clicking on blank part of canvas?
                    if (node.nodeFrom) {
                        Metamaps.JIT.selectEdgeOnClickHandler(node, e);
                    } else if (node && !node.nodeFrom) {
                        Metamaps.JIT.selectNodeOnClickHandler(node, e);
                    } else {
                        Metamaps.JIT.canvasClickHandler(eventInfo.getPos(), e);
                    } //if
                },
                //Add also a click handler to nodes
                onRightClick: function (node, eventInfo, e) {

                    node = eventInfo.getNode();
                    //clicking on a edge, node, or clicking on blank part of canvas?
                    if (node.nodeFrom) {
                        Metamaps.JIT.selectEdgeOnRightClickHandler(node, e);
                    } else if (node && !node.nodeFrom) {
                        Metamaps.JIT.selectNodeOnRightClickHandler(node, e);
                    } else {

                    } //if
                }
            },
            //Number of iterations for the FD algorithm
            iterations: 200,
            //Edge length
            levelDistance: 200,
        },
        nodeSettings: {
            'customNode': {
                'render': function (node, canvas) {
                    var pos = node.pos.getc(true),
                        dim = node.getData('dim'),
                        topic = node.getData('topic'),
                        cat = topic ? topic.getMetacode().get('name') : false,
                        ctx = canvas.getCtx();

                    // if the topic is selected draw a circle around it
                    if (node.selected) {
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, dim + 3, 0, 2 * Math.PI, false);
                        ctx.strokeStyle = Metamaps.Settings.colors.topics.selected;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }

                    if (!cat || !imgArray[cat].complete || (typeof imgArray[cat].naturalWidth !== "undefined" && imgArray[cat].naturalWidth === 0)) {
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, dim, 0, 2 * Math.PI, false);
                        ctx.fillStyle = '#B6B2FD';
                        ctx.fill();
                    } else {
                        ctx.drawImage(imgArray[cat], pos.x - dim, pos.y - dim, dim * 2, dim * 2);
                    }
                },
                'contains': function (node, pos) {
                    var npos = node.pos.getc(true),
                        dim = node.getData('dim'),
                        arrayOfLabelLines = Metamaps.Util.splitLine(node.name, 30).split('\n'),
                        ctx = Metamaps.Visualize.mGraph.canvas.getCtx();

                    var height = 25 * arrayOfLabelLines.length;

                    var index, lineWidths = [];
                    for (index = 0; index < arrayOfLabelLines.length; ++index) {
                        lineWidths.push(ctx.measureText(arrayOfLabelLines[index]).width)
                    }
                    var width = Math.max.apply(null, lineWidths) + 8;
                    var labely = npos.y + node.getData("height") + 5 + height / 2;

                    var overLabel = this.nodeHelper.rectangle.contains({
                        x: npos.x,
                        y: labely
                    }, pos, width, height);

                    return this.nodeHelper.circle.contains(npos, pos, dim) || overLabel;
                }
            }
        },
        edgeSettings: {
            'customEdge': {
                'render': function (adj, canvas) {
                    Metamaps.JIT.edgeRender(adj, canvas)
                },
                'contains': function (adj, pos) {
                    var from = adj.nodeFrom.pos.getc(true),
                        to = adj.nodeTo.pos.getc(true);

                    return this.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon);
                }
            }
        },
        embed: {
            graphSettings: {

            },
            nodeSettings: {

            },
            edgeSettings: {
                'customEdge': {
                    'render': function (adj, canvas) {
                        Metamaps.JIT.edgeRenderEmbed(adj, canvas)
                    },
                    'contains': function (adj, pos) {
                        var from = adj.nodeFrom.pos.getc(true),
                            to = adj.nodeTo.pos.getc(true);

                        return this.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon);
                    }
                }
            }
        }
    }, // ForceDirected
    ForceDirected3D: {
        animate: {
            modes: ['linear'],
            transition: $jit.Trans.Elastic.easeOut,
            duration: 2500,
            onComplete: function () {
                Metamaps.Visualize.mGraph.busy = false;
            }
        },
        graphSettings: {
            //id of the visualization container
            injectInto: 'infovis',
            type: '3D',
            Scene: {
                Lighting: {
                    enable: false,
                    ambient: [0.5, 0.5, 0.5],
                    directional: {
                        direction: {
                            x: 1,
                            y: 0,
                            z: -1
                        },
                        color: [0.9, 0.9, 0.9]
                    }
                }
            },
            //Enable zooming and panning
            //by scrolling and DnD
            Navigation: {
                enable: false,
                //Enable panning events only if we're dragging the empty
                //canvas (and not a node).
                panning: 'avoid nodes',
                zooming: 10 //zoom speed. higher is more sensible
            },
            // Change node and edge styles such as
            // color and width.
            // These properties are also set per node
            // with dollar prefixed data-properties in the
            // JSON structure.
            Node: {
                overridable: true,
                type: 'sphere',
                dim: 15,
                color: '#ffffff'
            },
            Edge: {
                overridable: false,
                type: 'tube',
                color: '#111',
                lineWidth: 3
            },
            //Native canvas text styling
            Label: {
                type: 'HTML', //Native or HTML
                size: 10,
                style: 'bold'
            },
            // Add node events
            Events: {
                enable: true,
                type: 'Native',
                i: 0,
                onMouseMove: function (node, eventInfo, e) {
                    //if(this.i++ % 3) return;
                    var pos = eventInfo.getPos();
                    Metamaps.Visualize.cameraPosition.x += (pos.x - Metamaps.Visualize.cameraPosition.x) * 0.5;
                    Metamaps.Visualize.cameraPosition.y += (-pos.y - Metamaps.Visualize.cameraPosition.y) * 0.5;
                    Metamaps.Visualize.mGraph.plot();
                },
                onMouseWheel: function (delta) {
                    Metamaps.Visualize.cameraPosition.z += -delta * 20;
                    Metamaps.Visualize.mGraph.plot();
                },
                onClick: function () {}
            },
            //Number of iterations for the FD algorithm
            iterations: 200,
            //Edge length
            levelDistance: 100
        },
        nodeSettings: {

        },
        edgeSettings: {

        },
        embed: {
            graphSettings: {

            },
            nodeSettings: {

            },
            edgeSettings: {

            }
        }
    }, // ForceDirected3D
    RGraph: {
        animate: {
            modes: ['polar'],
            duration: 2000,
            onComplete: function () {
                Metamaps.Visualize.mGraph.busy = false;
            }
        },
        graphSettings: {
            //id of the visualization container
            injectInto: 'infovis',
            //Enable zooming and panning
            //by scrolling and DnD
            Navigation: {
                enable: true,
                type: 'HTML',
                //Enable panning events only if we're dragging the empty
                //canvas (and not a node).
                panning: 'avoid nodes',
                zooming: 28 //zoom speed. higher is more sensible
            },
            background: {
                type: 'Metamaps',
                CanvasStyles: {
                    strokeStyle: '#333',
                    lineWidth: 1.5
                }
            },
            //NodeStyles: {  
            //  enable: true,  
            //  type: 'Native',  
            //  stylesHover: {  
            //    dim: 30  
            //  },  
            //  duration: 300  
            //},
            // Change node and edge styles such as
            // color and width.
            // These properties are also set per node
            // with dollar prefixed data-properties in the
            // JSON structure.
            Node: {
                overridable: true,
                color: '#2D6A5D',
                type: 'customNode',
                dim: 25
            },
            Edge: {
                overridable: true,
                color: '#222222',
                type: 'customEdge',
                lineWidth: 2,
                alpha: 0.4
            },
            //Native canvas text styling
            Label: {
                type: 'HTML', //Native or HTML
                size: 20,
                //style: 'bold'
            },
            //Add Tips
            Tips: {
                enable: false,
                onShow: function (tip, node) {}
            },
            // Add node events
            Events: {
                enable: true,
                enableForEdges: true,
                type: 'HTML',
                onMouseMove: function (node, eventInfo, e) {
                    Metamaps.JIT.onMouseMoveHandler(node, eventInfo, e);
                },
                //Update node positions when dragged
                onDragMove: function (node, eventInfo, e) {
                    Metamaps.JIT.onDragMoveTopicHandler(node, eventInfo, e);
                },
                onDragEnd: function (node, eventInfo, e) {
                    Metamaps.JIT.onDragEndTopicHandler(node, eventInfo, e, false);
                },
                onDragCancel: function (node, eventInfo, e) {
                    Metamaps.JIT.onDragCancelHandler(node, eventInfo, e, false);
                },
                //Implement the same handler for touchscreens
                onTouchStart: function (node, eventInfo, e) {
                    //$jit.util.event.stop(e); //stop default touchmove event
                    //Metamaps.Visualize.mGraph.events.onMouseDown(e, null, eventInfo);
                    Metamaps.Visualize.mGraph.events.touched = true;
                    Metamaps.Touch.touchPos = eventInfo.getPos();
                    var canvas = Metamaps.Visualize.mGraph.canvas,
                        ox = canvas.translateOffsetX;
                    oy = canvas.translateOffsetY,
                    sx = canvas.scaleOffsetX,
                    sy = canvas.scaleOffsetY;
                    Metamaps.Touch.touchPos.x *= sx;
                    Metamaps.Touch.touchPos.y *= sy;
                    Metamaps.Touch.touchPos.x += ox;
                    Metamaps.Touch.touchPos.y += oy;

                    touchDragNode = node;
                },
                //Implement the same handler for touchscreens
                onTouchMove: function (node, eventInfo, e) {
                    if (Metamaps.Touch.touchDragNode) Metamaps.JIT.onDragMoveTopicHandler(Metamaps.Touch.touchDragNode, eventInfo, e);
                    else {
                        Metamaps.JIT.touchPanZoomHandler(eventInfo, e);
                        Metamaps.Visualize.mGraph.labels.hideLabel(Metamaps.Visualize.mGraph.graph.getNode(Metamaps.TopicCard.openTopicCard));
                    }
                },
                //Implement the same handler for touchscreens
                onTouchEnd: function (node, eventInfo, e) {

                },
                //Implement the same handler for touchscreens
                onTouchCancel: function (node, eventInfo, e) {

                },
                //Add also a click handler to nodes
                onClick: function (node, eventInfo, e) {

                    if (Metamaps.Mouse.boxStartCoordinates) {
                        Metamaps.Visualize.mGraph.busy = false;
                        Metamaps.Mouse.boxEndCoordinates = eventInfo.getPos();
                        Metamaps.JIT.selectNodesWithBox();
                        return;
                    }

                    if (e.target.id != "infovis-canvas") return false;

                    //clicking on a edge, node, or clicking on blank part of canvas?
                    if (node.nodeFrom) {
                        Metamaps.JIT.selectEdgeOnClickHandler(node, e);
                    } else if (node && !node.nodeFrom) {
                        Metamaps.JIT.selectNodeOnClickHandler(node, e);
                    } else {
                        Metamaps.JIT.canvasClickHandler(eventInfo.getPos(), e);
                    } //if
                }
            },
            //Number of iterations for the FD algorithm
            iterations: 200,
            //Edge length
            levelDistance: 200,
        },
        nodeSettings: {
            'customNode': {
                'render': function (node, canvas) {
                    var pos = node.pos.getc(true),
                        dim = node.getData('dim'),
                        cat = node.getData('metacode'),
                        ctx = canvas.getCtx();
                    // if the topic is on the Canvas draw a white circle around it
                    if (node.selected) {
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, dim + 3, 0, 2 * Math.PI, false);
                        ctx.strokeStyle = Metamaps.Settings.colors.topics.selected;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                    try {
                        ctx.drawImage(imgArray[cat], pos.x - dim, pos.y - dim, dim * 2, dim * 2);
                    } catch (e) {
                        alert("You've got an topic causing an issue! It's ->this-> one: " + cat);
                    }
                },
                'contains': function (node, pos) {
                    var npos = node.pos.getc(true),
                        dim = node.getData('dim');
                    return this.nodeHelper.circle.contains(npos, pos, dim);
                }
            }
        },
        edgeSettings: {
            'customEdge': {
                'render': function (adj, canvas) {
                    Metamaps.JIT.edgeRender(adj, canvas)
                },
                'contains': function (adj, pos) {
                    var from = adj.nodeFrom.pos.getc(true),
                        to = adj.nodeTo.pos.getc(true);

                    return this.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon);
                }
            }
        },
        embed: {
            graphSettings: {

            },
            nodeSettings: {

            },
            edgeSettings: {
                'customEdge': {
                    'render': function (adj, canvas) {
                        Metamaps.JIT.edgeRenderEmbed(adj, canvas)
                    },
                    'contains': function (adj, pos) {
                        var from = adj.nodeFrom.pos.getc(true),
                            to = adj.nodeTo.pos.getc(true);

                        return this.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon);
                    }
                }
            }
        }
    }, // RGraph
    addMetacode: function () {

        var self = Metamaps.JIT;
        // code from http://www.professorcloud.com/mainsite/carousel-integration.htm
        //mouseWheel:true,
        if (!self.metacodeIMGinit) {
            $("#metacodeImg").CloudCarousel({
                titleBox: $('#metacodeImgTitle'),
                yRadius: 40,
                xPos: 150,
                yPos: 40,
                speed: 0.15,
                mouseWheel: true,
                bringToFront: true
            });
            self.metacodeIMGinit = true;
            $('#topic_inlanguage').typeahead([
                {
                    name: 'topics',
                    template: '<p>{{value}}</p><div class="type">{{type}}</div><img width="20" height="20" src="{{typeImageURL}}" alt="{{type}}" title="{{type}}"/>',
                    remote: {
                        url: '/topics/autocomplete_topic_inlanguage?term=%QUERY'
                    },
                    engine: Hogan
          }
        ]);
            $('#topic_inlanguage').bind('typeahead:selected', function (event, datum, dataset) {
                Metamaps.Topic.getTopicFromAutocomplete(datum.id);
            });
        }
    }, // addMetacode  
    editMetacodeSet: function (id) {
        $('#metacodeImg, #metacodeImgTitle').empty();
        $('#metacodeImg').append('<img class="loadingMetacodes" width="40" height="40" src="/assets/loading.gif" alt="809" style="position: absolute; left: 130px; top: 80px; z-index: 100;">');
        $('#metacodeImg').removeData('cloudcarousel');
        var newMetacodes = "";
        /*            _.each(topics, function (topic) {
                newMetacodes += '<img class="cloudcarousel" width="40" height="40" src="' + imgArray[topic[1][1][0]].src + '" alt="' + topic.id + '" title="' + topic[1][1][0] + '"/>';
            });
            $('#metacodeImg').empty().append(newMetacodes).CloudCarousel({
                titleBox: $('#metacodeImgTitle'),
                yRadius: 40,
                xPos: 150,
                yPos: 40,
                speed: 0.15,
                mouseWheel: true,
                bringToFront: true
            });
        */

    }, // editMetacode
    onMouseEnter: function (edge) {

        $('canvas').css('cursor', 'pointer');
        var edgeIsSelected = Metamaps.Selected.Synapses.indexOf(edge);
        //following if statement only executes if the edge being hovered over is not selected
        if (edgeIsSelected == -1) {
            edge.setData('showDesc', true, 'current');
            edge.setDataset('end', {
                lineWidth: 4,
                alpha: 1
            });
            Metamaps.Visualize.mGraph.fx.animate({
                modes: ['edge-property:lineWidth:color:alpha'],
                duration: 100
            });
            Metamaps.Visualize.mGraph.plot();
        }
    }, // onMouseEnter
    onMouseLeave: function (edge) {
        $('canvas').css('cursor', 'default');
        var edgeIsSelected = Metamaps.Selected.Synapses.indexOf(edge);
        //following if statement only executes if the edge being hovered over is not selected
        if (edgeIsSelected == -1) {
            edge.setData('showDesc', false, 'current');
            edge.setDataset('end', {
                lineWidth: 2,
                alpha: 0.4
            });
            Metamaps.Visualize.mGraph.fx.animate({
                modes: ['edge-property:lineWidth:color:alpha'],
                duration: 100
            });
        }
        Metamaps.Visualize.mGraph.plot();
    }, // onMouseLeave
    onMouseMoveHandler: function (node, eventInfo, e) {

        var self = Metamaps.JIT;

        if (Metamaps.Visualize.mGraph.busy) return;

        var node = eventInfo.getNode();
        var edge = eventInfo.getEdge();

        //if we're on top of a node object, act like there aren't edges under it
        if (node != false) {
            if (Metamaps.Mouse.edgeHoveringOver) {
                self.onMouseLeave(Metamaps.Mouse.edgeHoveringOver);
            }
            $('canvas').css('cursor', 'pointer');
            return;
        }

        if (edge == false && Metamaps.Mouse.edgeHoveringOver != false) {
            //mouse not on an edge, but we were on an edge previously
            self.onMouseLeave(Metamaps.Mouse.edgeHoveringOver);
        } else if (edge != false && Metamaps.Mouse.edgeHoveringOver == false) {
            //mouse is on an edge, but there isn't a stored edge
            self.onMouseEnter(edge);
        } else if (edge != false && Metamaps.Mouse.edgeHoveringOver != edge) {
            //mouse is on an edge, but a different edge is stored
            self.onMouseLeave(Metamaps.Mouse.edgeHoveringOver)
            self.onMouseEnter(edge);
        }

        //could be false
        Metamaps.Mouse.edgeHoveringOver = edge;

        if (!node && !edge) {
            $('canvas').css('cursor', 'default');
        }
    }, // onMouseMoveHandler
    enterKeyHandler: function () {
        // this is to submit new topic creation
        if (Metamaps.Create.newTopic.beingCreated) {
            Metamaps.Topic.createTopicLocally();
        } else if (Metamaps.Create.newSynapse.beingCreated) {
            Metamaps.Synapse.createSynapseLocally();
        }
    }, //enterKeyHandler
    escKeyHandler: function () {
        Metamaps.Control.deselectAllEdges();
        Metamaps.Control.deselectAllNodes();
    }, //escKeyHandler
    touchPanZoomHandler: function (eventInfo, e) {
        if (e.touches.length == 1) {
            var thispos = Metamaps.Touch.touchPos,
                currentPos = eventInfo.getPos(),
                canvas = Metamaps.Visualize.mGraph.canvas,
                ox = canvas.translateOffsetX,
                oy = canvas.translateOffsetY,
                sx = canvas.scaleOffsetX,
                sy = canvas.scaleOffsetY;
            currentPos.x *= sx;
            currentPos.y *= sy;
            currentPos.x += ox;
            currentPos.y += oy;
            //var x = currentPos.x - thispos.x,
            //    y = currentPos.y - thispos.y;
            var x = currentPos.x - thispos.x,
                y = currentPos.y - thispos.y;
            Metamaps.Touch.touchPos = currentPos;
            Metamaps.Visualize.mGraph.canvas.translate(x * 1 / sx, y * 1 / sy);
        } else if (e.touches.length == 2) {
            var touch1 = e.touches[0];
            var touch2 = e.touches[1];

            var dist = Metamaps.Util.getDistance({
                x: touch1.clientX,
                y: touch1.clientY
            }, {
                x: touch2.clientX,
                y: touch2.clientY
            });

            if (!lastDist) {
                lastDist = dist;
            }

            var scale = dist / lastDist;

            console.log(scale);

            if (8 >= Metamaps.Visualize.mGraph.canvas.scaleOffsetX * scale && Metamaps.Visualize.mGraph.canvas.scaleOffsetX * scale >= 1) {
                Metamaps.Visualize.mGraph.canvas.scale(scale, scale);
            }
            if (Metamaps.Visualize.mGraph.canvas.scaleOffsetX < 0.5) {
                Metamaps.Visualize.mGraph.canvas.viz.labels.hideLabels(true);
            } else if (Metamaps.Visualize.mGraph.canvas.scaleOffsetX > 0.5) {
                Metamaps.Visualize.mGraph.canvas.viz.labels.hideLabels(false);
            }
            lastDist = dist;
        }

    }, // touchPanZoomHandler
    onDragMoveTopicHandler: function (node, eventInfo, e) {

        var self = Metamaps.JIT;

        if (node && !node.nodeFrom) {
            Metamaps.Create.newTopic.hide();
            Metamaps.Create.newSynapse.hide();
            var pos = eventInfo.getPos();
            // if it's a left click, or a touch, move the node
            if (e.touches || (e.button == 0 && !e.altKey && (e.buttons == 0 || e.buttons == 1 || e.buttons == undefined))) {
                //if the node dragged isn't already selected, select it
                var whatToDo = self.handleSelectionBeforeDragging(node, e);
                if (node.pos.rho || node.pos.rho === 0) {
                    var rho = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
                    var theta = Math.atan2(pos.y, pos.x);
                    node.pos.setp(theta, rho);
                } else if (whatToDo == 'only-drag-this-one') {
                    node.pos.setc(pos.x, pos.y);
                    node.setData('xloc', pos.x);
                    node.setData('yloc', pos.y);
                } else {
                    var len = Metamaps.Selected.Topics.length;

                    //first define offset for each node
                    var xOffset = new Array();
                    var yOffset = new Array();
                    for (var i = 0; i < len; i += 1) {
                        var n = Metamaps.Selected.Topics[i];
                        xOffset[i] = n.pos.x - node.pos.x;
                        yOffset[i] = n.pos.y - node.pos.y;
                    } //for

                    for (var i = 0; i < len; i += 1) {
                        var n = Metamaps.Selected.Topics[i];
                        var x = pos.x + xOffset[i];
                        var y = pos.y + yOffset[i];
                        n.pos.setc(x, y);
                        n.setData('xloc', x);
                        n.setData('yloc', y);
                    } //for
                } //if

                if (whatToDo == 'deselect') {
                    Metamaps.Control.deselectNode(node);
                }
                Metamaps.Visualize.mGraph.plot();
            }
            // if it's a right click or holding down alt, start synapse creation  ->third option is for firefox
            else if ((e.button == 2 || (e.button == 0 && e.altKey) || e.buttons == 2) && userid != null) {
                if (tempInit == false) {
                    tempNode = node;
                    tempInit = true;

                    // set the draw synapse start positions
                    var l = Metamaps.Selected.Topics.length;
                    if (l > 0) {
                        for (var i = l - 1; i >= 0; i -= 1) {
                            var n = Metamaps.Selected.Topics[i];
                            Metamaps.Mouse.synapseStartCoordinates.push({
                                x: n.pos.getc().x,
                                y: n.pos.getc().y
                            });
                        }
                    } else {
                        Metamaps.Mouse.synapseStartCoordinates = [{
                            x: tempNode.pos.getc().x,
                            y: tempNode.pos.getc().y
                        }];
                    }
                    Metamaps.Mouse.synapseEndCoordinates = {
                        x: pos.x,
                        y: pos.y
                    };
                }
                //
                temp = eventInfo.getNode();
                if (temp != false && temp.id != node.id && Metamaps.Selected.Topics.indexOf(temp) == -1) { // this means a Node has been returned
                    tempNode2 = temp;
                    Metamaps.Visualize.mGraph.plot();

                    Metamaps.Mouse.synapseEndCoordinates = {
                        x: tempNode2.pos.getc().x,
                        y: tempNode2.pos.getc().y
                    };

                    // before making the highlighted one bigger, make sure all the others are regular size
                    Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                        n.setData('dim', 25, 'current');
                    });
                    temp.setData('dim', 35, 'current');
                    Metamaps.Visualize.mGraph.fx.plotNode(tempNode, Metamaps.Visualize.mGraph.canvas);
                    Metamaps.Visualize.mGraph.fx.plotNode(temp, Metamaps.Visualize.mGraph.canvas);
                } else if (!temp) {
                    tempNode2 = null;
                    Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                        n.setData('dim', 25, 'current');
                    });
                    //pop up node creation :)
                    var myX = e.clientX - 110;
                    var myY = e.clientY - 30;
                    $('#new_topic').css('left', myX + "px");
                    $('#new_topic').css('top', myY + "px");
                    $('#new_synapse').css('left', myX + "px");
                    $('#new_synapse').css('top', myY + "px");
                    Metamaps.Create.newTopic.x = eventInfo.getPos().x;
                    Metamaps.Create.newTopic.y = eventInfo.getPos().y;
                    Metamaps.Visualize.mGraph.plot();

                    Metamaps.Mouse.synapseEndCoordinates = {
                        x: pos.x,
                        y: pos.y
                    };
                }
            }
        }
    }, // onDragMoveTopicHandler
    onDragCancelHandler: function (node, eventInfo, e, centred) {
        tempNode = null;
        tempNode2 = null;
        tempInit = false;
        // reset the draw synapse positions to false
        Metamaps.Mouse.synapseStartCoordinates = [];
        Metamaps.Mouse.synapseEndCoordinates = null;
        Metamaps.Visualize.mGraph.plot();
    }, // onDragCancelHandler
    onDragEndTopicHandler: function (node, eventInfo, e, allowRealtime) {
        if (tempInit && tempNode2 == null) {
            Metamaps.Create.newTopic.addSynapse = true;
            $('#new_topic').fadeIn('fast');
            Metamaps.Create.newTopic.beingCreated = true;
            Metamaps.JIT.addMetacode();
            $('#topic_name').focus();
        } else if (tempInit && tempNode2 != null) {
            Metamaps.Create.newTopic.addSynapse = false;
            Metamaps.Create.newSynapse.topic1id = tempNode.id;
            Metamaps.Create.newSynapse.topic2id = tempNode2.id;
            Metamaps.Create.newSynapse.open();
            Metamaps.Create.newSynapse.beingCreated = true
            tempNode = null;
            tempNode2 = null;
            tempInit = false;
        }
    }, //onDragEndTopicHandler
    canvasClickHandler: function (canvasLoc, e) {
        //grab the location and timestamp of the click 
        var storedTime = Metamaps.Mouse.lastCanvasClick;
        var now = Date.now(); //not compatible with IE8 FYI 
        Metamaps.Mouse.lastCanvasClick = now;

        if (now - storedTime < Metamaps.Mouse.DOUBLE_CLICK_TOLERANCE) {
            // DOUBLE CLICK
            //pop up node creation :) 
            Metamaps.Create.newTopic.addSynapse = false;
            Metamaps.Create.newTopic.x = canvasLoc.x;
            Metamaps.Create.newTopic.y = canvasLoc.y;
            $('#new_topic').css('left', e.clientX + "px");
            $('#new_topic').css('top', e.clientY + "px");
            $('#new_topic').fadeIn('fast');
            Metamaps.Create.newTopic.beingCreated = true;
            Metamaps.JIT.addMetacode();
            $('#topic_name').focus();
        } else if (!Metamaps.Mouse.didPan) {
            // SINGLE CLICK
            Metamaps.TopicCard.hideCard();
            $('#new_topic').fadeOut('fast');
            $("#topic_name").typeahead('setQuery', '');
            Metamaps.Create.newTopic.beingCreated = false;
            $('#new_synapse').fadeOut('fast');
            Metamaps.Create.newSynapse.beingCreated = false;
            $('.rightclickmenu').remove();
            // reset the draw synapse positions to false
            Metamaps.Mouse.synapseStartCoordinates = [];
            Metamaps.Mouse.synapseEndCoordinates = null;
            tempInit = false;
            tempNode = null;
            tempNode2 = null;
            Metamaps.Control.deselectAllEdges();
            Metamaps.Control.deselectAllNodes();
        }
    }, //canvasClickHandler 
    nodeDoubleClickHandler: function (node, e) {

        Metamaps.TopicCard.showCard(node);

    }, // nodeDoubleClickHandler
    nodeWasDoubleClicked: function () {
        //grab the timestamp of the click 
        var storedTime = Metamaps.Mouse.lastNodeClick;
        var now = Date.now(); //not compatible with IE8 FYI 
        Metamaps.Mouse.lastNodeClick = now;

        if (now - storedTime < Metamaps.Mouse.DOUBLE_CLICK_TOLERANCE) {
            return true;
        } else {
            return false;
        }
    }, //nodeWasDoubleClicked;
    handleSelectionBeforeDragging: function (node, e) {
        // four cases:
        // 1 nothing is selected, so pretend you aren't selecting
        // 2 others are selected only and shift, so additionally select this one
        // 3 others are selected only, no shift: drag only this one
        // 4 this node and others were selected, so drag them (just return false)
        //return value: deselect node again after?
        if (Metamaps.Selected.Topics.length == 0) {
            Metamaps.Control.selectNode(node);
            return 'deselect';
        }
        if (Metamaps.Selected.Topics.indexOf(node) == -1) {
            if (e.shiftKey) {
                Metamaps.Control.selectNode(node);
                return 'nothing';
            } else {
                return 'only-drag-this-one';
            }
        }
        return 'nothing'; //case 4?
    }, //  handleSelectionBeforeDragging
    selectNodesWithBox: function () {

        var sX = Metamaps.Mouse.boxStartCoordinates.x,
            sY = Metamaps.Mouse.boxStartCoordinates.y,
            eX = Metamaps.Mouse.boxEndCoordinates.x,
            eY = Metamaps.Mouse.boxEndCoordinates.y;


        Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
            var x = n.pos.x,
                y = n.pos.y;

            if ((sX < x && x < eX && sY < y && y < eY) || (sX > x && x > eX && sY > y && y > eY) || (sX > x && x > eX && sY < y && y < eY) || (sX < x && x < eX && sY > y && y > eY)) {
                var nodeIsSelected = Metamaps.Selected.Topics.indexOf(n);
                if (nodeIsSelected == -1) Metamaps.Control.selectNode(n); // the node is not selected, so select it
                else if (nodeIsSelected != -1) Metamaps.Control.deselectNode(n); // the node is selected, so deselect it

            }
        });

        Metamaps.Mouse.boxStartCoordinates = false;
        Metamaps.Mouse.boxEndCoordinates = false;
        Metamaps.Visualize.mGraph.plot();
    }, // selectNodesWithBox
    drawSelectBox: function (eventInfo, e) {
        var ctx = Metamaps.Visualize.mGraph.canvas.getCtx();

        var startX = Metamaps.Mouse.boxStartCoordinates.x,
            startY = Metamaps.Mouse.boxStartCoordinates.y,
            currX = eventInfo.getPos().x,
            currY = eventInfo.getPos().y;

        Metamaps.Visualize.mGraph.canvas.clear();
        Metamaps.Visualize.mGraph.plot();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, currY);
        ctx.lineTo(currX, currY);
        ctx.lineTo(currX, startY);
        ctx.lineTo(startX, startY);
        ctx.strokeStyle = "black";
        ctx.stroke();
    }, // drawSelectBox
    selectNodeOnClickHandler: function (node, e) {
        if (Metamaps.Visualize.mGraph.busy) return;

        var self = Metamaps.JIT;

        // catch right click on mac, which is often like ctrl+click
        if (navigator.platform.indexOf("Mac") != -1 && e.ctrlKey) {
            self.selectNodeOnRightClickHandler(node, e)
            return;
        }

        // if on a topic page, let alt+click center you on a new topic
        if (Metamaps.Active.Topic && e.altKey) {
            Metamaps.RGraph.centerOn(node.id);
            return;
        }

        var check = self.nodeWasDoubleClicked();
        if (check) {
            self.nodeDoubleClickHandler(node, e);
            return;
        } else {
            // wait a certain length of time, then check again, then run this code
            setTimeout(function () {
                if (!Metamaps.JIT.nodeWasDoubleClicked()) {
                    if (!e.shiftKey) {
                        Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                            if (n.id != node.id) {
                                Metamaps.Control.deselectNode(n);
                            }
                        });
                    }
                    if (node.selected) {
                        Metamaps.Control.deselectNode(node);
                    } else {
                        Metamaps.Control.selectNode(node);
                    }
                    //trigger animation to final styles
                    Metamaps.Visualize.mGraph.fx.animate({
                        modes: ['edge-property:lineWidth:color:alpha'],
                        duration: 500
                    });
                    Metamaps.Visualize.mGraph.plot();
                }
            }, Metamaps.Mouse.DOUBLE_CLICK_TOLERANCE);
        }
    }, //selectNodeOnClickHandler
    selectNodeOnRightClickHandler: function (node, e) {
        // the 'node' variable is a JIT node, the one that was clicked on
        // the 'e' variable is the click event

        e.preventDefault();
        e.stopPropagation();

        if (Metamaps.Visualize.mGraph.busy) return;

        // delete old right click menu
        $('.rightclickmenu').remove();
        // create new menu for clicked on node
        var rightclickmenu = document.createElement("div");
        rightclickmenu.className = "rightclickmenu";

        // add the proper options to the menu
        var menustring = '<ul>';

        if (userid != null) menustring += '<li class="rc-delete">Delete</li>';
        if (Metamaps.Active.Map.id && userid != null) menustring += '<li class="rc-remove">Remove from map</li>';
        menustring += '<li class="rc-hide">Hide until refresh</li>';

        if (!Metamaps.Active.Map) menustring += '<li class="rc-center">Center this topic</li>';
        menustring += '<li class="rc-popout">Open in new tab</li>';
        if (userid) {
            var options = '<ul><li class="changeP toCommons">commons</li> \
                         <li class="changeP toPublic">public</li> \
                         <li class="changeP toPrivate">private</li> \
                     </ul>';

            menustring += '<li class="rc-permission">Change permissions' + options + '</li>';
        }

        menustring += '</ul>';
        rightclickmenu.innerHTML = menustring;

        // position the menu where the click happened
        $(rightclickmenu).css({
            left: e.clientX,
            top: e.clientY
        });
        //add the menu to the page
        $('#center-container').append(rightclickmenu);


        // attach events to clicks on the list items

        // delete the selected things from the database
        $('.rc-delete').click(function () {
            $('.rightclickmenu').remove();
            var n = Metamaps.Selected.Topics.length;
            var e = Metamaps.Selected.Synapses.length;
            var ntext = n == 1 ? "1 topic" : n + " topics";
            var etext = e == 1 ? "1 synapse" : e + " synapses";
            var text = "You have " + ntext + " and " + etext + " selected. ";

            var r = confirm(text + "Are you sure you want to permanently delete them all? This will remove them from all maps they appear on.");
            if (r == true) {
                Metamaps.Control.deleteSelectedEdges();
                Metamaps.Control.deleteSelectedNodes();
            }
        });

        // remove the selected things from the map
        $('.rc-remove').click(function () {
            $('.rightclickmenu').remove();
            Metamaps.Control.removeSelectedEdges();
            Metamaps.Control.removeSelectedNodes();
        });

        // hide selected nodes and synapses until refresh
        $('.rc-hide').click(function () {
            $('.rightclickmenu').remove();
            Metamaps.Control.hideSelectedEdges();
            Metamaps.Control.hideSelectedNodes();
        });

        // when in radial, center on the topic you picked
        $('.rc-center').click(function () {
            $('.rightclickmenu').remove();
            centerOn(node.id);
        });

        // open the entity in a new tab
        $('.rc-popout').click(function () {
            $('.rightclickmenu').remove();
            var win = window.open('/topics/' + node.id, '_blank');
            win.focus();
        });

        // change the permission of all the selected nodes and synapses that you were the originator of
        $('.rc-permission li').click(function () {
            $('.rightclickmenu').remove();
            // $(this).text() will be 'commons' 'public' or 'private'
            Metamaps.Control.updateSelectedPermissions($(this).text());
        });

    }, //selectNodeOnRightClickHandler
    selectEdgeOnClickHandler: function (adj, e) {
        if (Metamaps.Visualize.mGraph.busy) return;

        //editing overrides everything else
        if (e.altKey) {
            //in select-edit-delete-nodes-and-edges.js
            // editEdge(adj, e);  TODO need to find and reimplement this function
            return;
        }

        var edgeIsSelected = Metamaps.Selected.Synapses.indexOf(adj);
        if (edgeIsSelected == -1) edgeIsSelected = false;
        else if (edgeIsSelected != -1) edgeIsSelected = true;

        if (edgeIsSelected && e.shiftKey) {
            //deselecting an edge with shift
            Metamaps.Control.deselectEdge(adj);
        } else if (!edgeIsSelected && e.shiftKey) {
            //selecting an edge with shift
            Metamaps.Control.selectEdge(adj);
        } else if (edgeIsSelected && !e.shiftKey) {
            //deselecting an edge without shift - unselect all
            Metamaps.Control.deselectAllEdges();
        } else if (!edgeIsSelected && !e.shiftKey) {
            //selecting an edge without shift - unselect all but new one
            Metamaps.Control.deselectAllEdges();
            Metamaps.Control.selectEdge(adj);
        }

        Metamaps.Visualize.mGraph.plot();
    }, //selectEdgeOnClickHandler
    selectEdgeOnRightClickHandler: function (adj, e) {
        if (Metamaps.Visualize.mGraph.busy) return;

        console.log('edge right click handler working');
    }, //selectEdgeOnRightClickHandler
    SmoothPanning: function () {

        var sx = Metamaps.Visualize.mGraph.canvas.scaleOffsetX,
            sy = Metamaps.Visualize.mGraph.canvas.scaleOffsetY,
            y_velocity = Metamaps.Mouse.changeInY, // initial y velocity
            x_velocity = Metamaps.Mouse.changeInX, // initial x velocity
            easing = 1; // frictional value

        easing = 1;
        window.clearInterval(panningInt)
        panningInt = setInterval(function () {
            myTimer()
        }, 1);

        function myTimer() {
            Metamaps.Visualize.mGraph.canvas.translate(x_velocity * easing * 1 / sx, y_velocity * easing * 1 / sy);
            easing = easing * 0.75;

            if (easing < 0.1) window.clearInterval(panningInt);
        }
    }, // SmoothPanning
    generateLittleHTML: function (node) {
        var mapperm = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper);

        var littleHTML = '<div class="label">{{ name }}</div><div class="nodeOptions">';

        if (userid == null || !Metamaps.Active.Map || !mapperm) {
            //unauthenticated, not on a map: can remove from canvas
            littleHTML += '<span class="removeFromCanvas" onclick="Metamaps.Control.hideNode({{ id }})" title="Click to remove topic from canvas"></span>';
        } else if (mapperm) {
            //permission to remove nodes from the map
            littleHTML += '<span class="removeFromCanvas" onclick="Metamaps.Control.hideNode({{ id }})" title="Click to remove topic from canvas"></span><span class="removeFromMap" onclick="Metamaps.Control.removeNode({{ id }})" title="Click to remove topic from map"></span>';
        }

        if (userid == node.getData('userid')) {
            //logged in, and owner of the topic, thus permission to delete
            littleHTML += '<span class="deleteTopic" onclick="" title="Click to delete this topic"></span>';
        }
        littleHTML += '</div>';

        var render = _.template(littleHTML);
        var map;
        Metamaps.Active.Map ? map = Metamaps.Active.Topic.id : map = null;
        return render({
            id: node.id,
            mapid: map,
            name: node.name
        });
    }, // generateLittleHTML
    renderMidArrow: function (from, to, dim, swap, canvas, placement, newSynapse) {
        var ctx = canvas.getCtx();
        // invert edge direction 
        if (swap) {
            var tmp = from;
            from = to;
            to = tmp;
        }
        // vect represents a line from tip to tail of the arrow 
        var vect = new $jit.Complex(to.x - from.x, to.y - from.y);
        // scale it 
        vect.$scale(dim / vect.norm());
        // compute the midpoint of the edge line 
        var newX = (to.x - from.x) * placement + from.x;
        var newY = (to.y - from.y) * placement + from.y;
        var midPoint = new $jit.Complex(newX, newY);

        // move midpoint by half the "length" of the arrow so the arrow is centered on the midpoint 
        var arrowPoint = new $jit.Complex((vect.x / 0.7) + midPoint.x, (vect.y / 0.7) + midPoint.y);
        // compute the tail intersection point with the edge line 
        var intermediatePoint = new $jit.Complex(arrowPoint.x - vect.x, arrowPoint.y - vect.y);
        // vector perpendicular to vect 
        var normal = new $jit.Complex(-vect.y / 2, vect.x / 2);
        var v1 = intermediatePoint.add(normal);
        var v2 = intermediatePoint.$add(normal.$scale(-1));

        if (newSynapse) {
            ctx.strokeStyle = "#222222";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
        }
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(arrowPoint.x, arrowPoint.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.stroke();
    }, // renderMidArrow
    renderEdgeArrows: function (edgeHelper, adj, synapse) {

        var self = Metamaps.JIT;

        var canvas = Metamaps.Visualize.mGraph.canvas;
        
        var directionCat = synapse.get('category');
        var direction = synapse.getDirection();
        
        var pos = adj.nodeFrom.pos.getc(true);
        var posChild = adj.nodeTo.pos.getc(true);

        //plot arrow edge 
        if (directionCat == "none") {
            edgeHelper.line.render({
                x: pos.x,
                y: pos.y
            }, {
                x: posChild.x,
                y: posChild.y
            }, canvas);
        } else if (directionCat == "both") {
            self.renderMidArrow({
                x: pos.x,
                y: pos.y
            }, {
                x: posChild.x,
                y: posChild.y
            }, 13, true, canvas, 0.7);
            self.renderMidArrow({
                x: pos.x,
                y: pos.y
            }, {
                x: posChild.x,
                y: posChild.y
            }, 13, false, canvas, 0.7);
        } else if (directionCat == "from-to") {
            var direction = adj.data.$direction;
            var inv = (direction && direction.length > 1 && direction[0] != adj.nodeFrom.id);
            self.renderMidArrow({
                x: pos.x,
                y: pos.y
            }, {
                x: posChild.x,
                y: posChild.y
            }, 13, inv, canvas, 0.7);
            self.renderMidArrow({
                x: pos.x,
                y: pos.y
            }, {
                x: posChild.x,
                y: posChild.y
            }, 13, inv, canvas, 0.3);
        }
    } //renderEdgeArrows
};
Metamaps.Listeners = {

    init: function () {

        $(document).on('keydown', function (e) {
            switch (e.which) {
            case 13:
                Metamaps.JIT.enterKeyHandler();
                e.preventDefault();
                break;
            case 27:
                Metamaps.JIT.escKeyHandler();
                break;
            default:
                break; //alert(e.which);
            }
        });

        //$(window).resize(function () {
        //    Metamaps.Visualize.mGraph.canvas.resize($(window).width(), $(window).height());
        //});
    }
};

Metamaps.Map = {
    // this function is to retrieve a map JSON object from the database
    // @param id = the id of the map to retrieve
    get: function (id, callback) {
        // if the desired topic is not yet in the local topic repository, fetch it
        if (Metamaps.Maps.get(id) == undefined) {
            if (!callback) {
                var e = $.ajax({
                    url: "/maps/" + id + ".json",
                    async: false
                });
                Metamaps.Maps.add($.parseJSON(e.responseText));
                return Metamaps.Maps.get(id);
            } else {
                return $.ajax({
                    url: "/users/" + id + ".json",
                    success: function (data) {
                        Metamaps.Maps.add(data);
                        callback(Metamaps.Maps.get(id));
                    }
                });
            }
        } else {
            if (!callback) {
                return Metamaps.Maps.get(id);
            } else {
                return callback(Metamaps.Maps.get(id));
            }
        }
    },
};
Metamaps.Maps = null; // will be initialized in Metamaps.Backbone.init as a MapCollection

Metamaps.Mapper = {
    // this function is to retrieve a mapper JSON object from the database
    // @param id = the id of the mapper to retrieve
    get: function (id, callback) {
        // if the desired topic is not yet in the local topic repository, fetch it
        if (Metamaps.Mappers.get(id) == undefined) {
            if (!callback) {
                var e = $.ajax({
                    url: "/users/" + id + ".json",
                    async: false
                });
                Metamaps.Mappers.add($.parseJSON(e.responseText));
                return Metamaps.Mappers.get(id);
            } else {
                return $.ajax({
                    url: "/users/" + id + ".json",
                    success: function (data) {
                        Metamaps.Mappers.add(data);
                        callback(Metamaps.Mappers.get(id));
                    }
                });
            }
        } else {
            if (!callback) {
                return Metamaps.Mappers.get(id);
            } else {
                return callback(Metamaps.Mappers.get(id));
            }
        }
    },
};
Metamaps.Mappers = null; // will be initialized in Metamaps.Backbone.init as a MapperCollection

Metamaps.Mouse = {
    didPan: false,
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
Metamaps.Organize = {
    init: function () {

    },
    arrange: function (layout, centerNode) {
        console.log(centerNode);
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
            var numNodes = _.size(Metamaps.Visualize.mGraph.graph.nodes); // this will always be an integer, the # of nodes on your graph visualization
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
            /*        
        centerNode.eachAdjacency(function(n) {
          var newPos = new $jit.Complex();
          newPos.x = lineLength*Math.sin(degree) +centerX;
          newPos.y = lineLength*Math.cos(degree) +centerY;
          n.nodeTo.setPos(newPos, 'end');
          degree += angle;
        });
        Metamaps.Visualize.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);
 */





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





            /*
        var radial = function (input) {
            if (column == numColumns) {
              column = 0;
              row += 1;
            } 
            var newPos = new $jit.Complex();
            newPos.x = column*GRIDSPACE;
            newPos.y = row*GRIDSPACE;
            n.setPos(newPos, 'end');

        });
        Metamaps.Visualize.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);*/
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
            console.log("new offset: (before translate)", Metamaps.Visualize.mGraph.canvas.translateOffsetX, Metamaps.Visualize.mGraph.canvas.translateOffsetY);
            console.log("new offset: (before translate)", Metamaps.Visualize.mGraph.canvas.translateOffsetX, Metamaps.Visualize.mGraph.canvas.translateOffsetY);
            Metamaps.Visualize.mGraph.canvas.translate(newOriginX - oldOriginX, newOriginY - oldOriginY);
            console.log("ideal offset: ", newOriginX, newOriginY);
            console.log("new offset: ", Metamaps.Visualize.mGraph.canvas.translateOffsetX, Metamaps.Visualize.mGraph.canvas.translateOffsetY);
            console.log("new offset: ", Metamaps.Visualize.mGraph.canvas.translateOffsetX, Metamaps.Visualize.mGraph.canvas.translateOffsetY);






        } else alert('please call function with a valid layout dammit!');
    },
    loadSavedLayout: function (id) {
        Metamaps.Visualize.computePositions();
        Metamaps.Visualize.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);
    },
    saveNewLayout: function () {
        var layoutName = prompt("Enter a name for your layout...");
        if (layoutName === null) return;
        var layoutObject = {};
        Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
            layoutObject[n.data.$id] = {
                x: n.getPos().x,
                y: n.getPos().y
            };
        });

        function addMetadata(e) {
            // add the 'expressed In English' field
            Metamaps.Field.createFieldInDatabase("topic", e.id, 1, layoutName);
            // add the 'is a' synapses
            Metamaps.Synapse.createSynapseInDatabase(e.id, 2, 1087, false);
            // add the 'saved coordinates' field
            Metamaps.Field.createFieldInDatabase("topic", e.id, 1088, JSON.stringify(layoutObject));
            // add the 'is layout for' synapses
            Metamaps.Synapse.createSynapseInDatabase(e.id, 1089, Metamaps.Active.Topic.id, false);
            $('#saveLayout').text('Saved!');
            setTimeout(function () {
                $('#saveLayout').text('Save New Layout')
            }, 1500);
            Metamaps.Topic.get(e.id, function (ee) {
                // add the new layout to the list
                $('#selectSavedLayout').append(Metamaps.Util.generateOptionsList([ee]));
                // switch to the new layout
                $('#selectSavedLayout').val(ee.id);
            });
        }
        // call create topic which will run 'addMetadata' when it works
        Metamaps.Topic.createTopicInDatabase(addMetadata, []);
    },
    saveCurrentLayout: function () {
        var id = $('#selectSavedLayout option:selected').val();
        if (id != "") {
            Metamaps.Topic.get(id, function (e) {
                // this is where the actual saved coordinates are
                var fieldID = e[1088][2][0];
                var layoutObject = {};
                Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
                    layoutObject[n.data.$id] = {
                        x: n.getPos().x,
                        y: n.getPos().y
                    };
                });
                // update the 'saved coordinates' field
                Metamaps.Field.updateFieldInDatabase(fieldID, JSON.stringify(layoutObject));
                Metamaps.Topic.refresh(e.id);
                $('#updateLayout').text('Updated!');
                setTimeout(function () {
                    $('#updateLayout').text('Overwrite Layout')
                }, 1500);
            });
        }
    }
};


Metamaps.Selected = {
    Topics: [],
    Synapses: []
};


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

        var newedge = mapping.createEdge();

        Metamaps.Visualize.mGraph.graph.addAdjacence(node1, node2, newedge.data);
        edgeOnViz = Metamaps.Visualize.mGraph.graph.getAdjacence(node1.id, node2.id);
        mapping.set('edge', edgeOnViz);
        mapping.updateEdge(); // links the topic and the mapping to the node 

        Metamaps.Visualize.mGraph.fx.plotLine(edgeOnViz, Metamaps.Visualize.mGraph.canvas);
        Metamaps.Control.selectEdge(edgeOnViz);

        if (!Metamaps.Settings.sandbox && createNewInDB) {
            if (synapse.isNew()) {
                synapse.save(null, {
                    success: function (synapseModel, response) {
                        synapseModel.updateMappings();
                        if (Metamaps.Active.Map) {
                            mapping.save();
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

        var len = Metamaps.Selected.Topics.length;
        if (len == 0) {
            synapsesToCreate[0] = Metamaps.Visualize.mGraph.graph.getNode(Metamaps.Create.newSynapse.topic1id);
        } else if (len > 0) {
            synapsesToCreate = Metamaps.Selected.Topics;
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
        var self = Metamaps.Synapse;

        Metamaps.Create.newSynapse.hide();

        var synapse = self.get(id);

        var mapping = new Metamaps.Backbone.Mapping({
            category: "Synapse",
            synapse_id: synapse.id
        });
        Metamaps.Mappings.add(mapping);

        self.renderSynapse(mapping, synapse, false);
    }
};


Metamaps.Synapses = {};


Metamaps.SynapseCard = {
    openSynapseCard: null
};


Metamaps.Touch = {
    touchPos: null, // this stores the x and y values of a current touch event 
    touchDragNode: null // this stores a reference to a JIT node that is being dragged
};


Metamaps.Util = {
    // helper function to determine how many lines are needed
    // Line Splitter Function
    // copyright Stephen Chapman, 19th April 2006
    // you may copy this code but please keep the copyright notice as well
    splitLine: function (st, n) {
        var b = '';
        var s = st;
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
};
Metamaps.Visualize = {
    mGraph: {}, // a reference to the graph object.
    cameraPosition: null, // stores the camera position when using a 3D visualization
    type: "ForceDirected", // the type of graph we're building, could be "RGraph", "ForceDirected", or "ForceDirected3D"
    savedLayout: true, // indicates whether the map has a saved layout or not
    loadLater: false, // indicates whether there is JSON that should be loaded right in the offset, or whether to wait till the first topic is created
    target: null, // the selector representing the location to render the graph
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
    render: function (targetID, vizData) {
        var self = Metamaps.Visualize;
        self.mGraph = {};
        self.target = targetID;
        self.__buildGraph(vizData);
    },
    computePositions: function () {
        var self = Metamaps.Visualize;
        if (self.type == "RGraph") {
            self.mGraph.graph.eachNode(function (n) {
                var pos = n.getPos();
                pos.setc(-200, -200);
            });
            self.mGraph.compute('end');
        } else if (self.type == "ForceDirected" && self.savedLayout) {
            var startPos, endPos, mapping;

            self.mGraph.graph.eachNode(function (n) {
                mapping = Metamaps.Mappings.get(n.id);
                mapping.set('node', n);
                mapping.updateNode();

                startPos = new $jit.Complex(0, 0);
                endPos = new $jit.Complex(mapping.get('xloc'), mapping.get('yloc'));
                n.setPos(startPos, 'start');
                n.setPos(endPos, 'end');
            });
        } else if (self.type == "ForceDirected3D" || !self.savedLayout) {
            self.mGraph.compute();
        }
    },
    /**
     * __buildGraph does the heavy lifting of creating the engine that renders the graph with the properties we desire
     *
     * @param vizData a json structure containing the data to be rendered.
     */
    __buildGraph: function (vizData) {
        var self = Metamaps.Visualize;

        // normally this will be true, and will enter into this first scenario
        if (!Metamaps.Settings.embed) {
            if (self.type == "RGraph") {
                $jit.RGraph.Plot.NodeTypes.implement(Metamaps.JIT.RGraph.nodeSettings);
                $jit.RGraph.Plot.EdgeTypes.implement(Metamaps.JIT.RGraph.edgeSettings);
                self.mGraph = new $jit.RGraph(Metamaps.JIT.RGraph.graphSettings);
            } else if (self.type == "ForceDirected") {
                $jit.ForceDirected.Plot.NodeTypes.implement(Metamaps.JIT.ForceDirected.nodeSettings);
                $jit.ForceDirected.Plot.EdgeTypes.implement(Metamaps.JIT.ForceDirected.edgeSettings);
                self.mGraph = new $jit.ForceDirected(Metamaps.JIT.ForceDirected.graphSettings);
            } else if (self.type == "ForceDirected3D") {
                // init ForceDirected3D
                self.mGraph = new $jit.ForceDirected3D(Metamaps.JIT.ForceDirected3D.graphSettings);
                self.cameraPosition = self.mGraph.canvas.canvases[0].camera.position;
            }
        } else { // in the case where these visualizations are to be embedded in other sites  TODO
            if (self.type == "RGraph") {
                $jit.RGraph.Plot.NodeTypes.implement(Metamaps.JIT.RGraph.embed.nodeSettings);
                $jit.RGraph.Plot.EdgeTypes.implement(Metamaps.JIT.RGraph.embed.edgeSettings);
                self.mGraph = new $jit.RGraph(Metamaps.JIT.RGraph.embed.graphSettings);
            } else if (self.type == "ForceDirected") {
                $jit.ForceDirected.Plot.NodeTypes.implement(Metamaps.JIT.ForceDirected.embed.nodeSettings);
                $jit.ForceDirected.Plot.EdgeTypes.implement(Metamaps.JIT.ForceDirected.embed.edgeSettings);
                self.mGraph = new $jit.ForceDirected(Metamaps.JIT.ForceDirected.embed.graphSettings);
            } else if (self.type == "ForceDirected3D") {
                // init ForceDirected3D
                self.mGraph = new $jit.ForceDirected3D(Metamaps.JIT.ForceDirected3D.embed.graphSettings);
                self.cameraPosition = self.mGraph.canvas.canvases[0].camera.position;
            }
        }

        // load JSON data, if it's not empty
        if (!self.loadLater) {
            //load JSON data.
            self.mGraph.loadJSON(vizData);
            //compute positions and plot.
            self.computePositions();
            if (self.type == "RGraph") {
                self.mGraph.fx.animate(Metamaps.JIT.RGraph.animate);
            } else if (self.type == "ForceDirected" && self.savedLayout) {
                return Metamaps.Organize.loadSavedLayout();
                //self.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout);
            } else if (self.type == "ForceDirected3D" || !self.savedLayout) {
                self.mGraph.animate(Metamaps.JIT.ForceDirected.animateFDLayout);
            }
        }
    }
};


Metamaps.Realtime = {
    // this is for the heroku staging environment
    //Metamaps.Realtime.socket = io.connect('http://gentle-savannah-1303.herokuapp.com'); 
    // this is for metamaps.cc
    //Metamaps.Realtime.socket = io.connect('http://metamaps.cc:5001');    
    // this is for localhost development    
    //Metamaps.Realtime.socket = io.connect('http://localhost:5001'); 
    socket: null,
    notifyTimeOut: null,
    init: function () {
        var mapperm = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper);

        if (mapperm) {
            Metamaps.Realtime.socket = io.connect('http://localhost:5001');
            Metamaps.Realtime.socket.on('connect', function () {
                console.log('socket connected');
                Metamaps.Realtime.setupSocket();
            });
        }
    },
    notifyUser: function (message) {
        if ($('.notice.metamaps').length == 0) {
            $('body').prepend('<div class="notice metamaps" />');
        }
        $('.notice.metamaps').hide().html(message).fadeIn('fast');

        clearTimeout(Metamaps.Realtime.notifyTimeOut);
        Metamaps.Realtime.notifyTimeOut = setTimeout(function () {
            $('.notice.metamaps').fadeOut('fast');
        }, 8000);
    },
    setupSocket: function () {
        var socket = Metamaps.Realtime.socket;

        socket.emit('newMapperNotify', {
            userid: userid,
            username: username,
            mapid: Metamaps.Active.Map.id
        });

        // if you're the 'new guy' update your list with who's already online
        socket.on(userid + '-' + Metamaps.Active.Map.id + '-UpdateMapperList', function (data) {
            // data.userid
            // data.username
            // data.userrealtime

            MetamapsModel.mappersOnMap[data.userid] = {
                name: data.username,
                realtime: data.userrealtime
            };

            var onOff = data.userrealtime ? "On" : "Off";
            var mapperListItem = '<li id="mapper' + data.userid + '" class="rtMapper littleRt' + onOff + '">' + data.username + '</li>';
            $('#mapper' + data.userid).remove();
            $('.realtimeMapperList ul').append(mapperListItem);
        });

        // receive word that there's a new mapper on the map
        socket.on('maps-' + Metamaps.Active.Map.id + '-newmapper', function (data) {
            // data.userid
            // data.username

            MetamapsModel.mappersOnMap[data.userid] = {
                name: data.username,
                realtime: false
            };

            var mapperListItem = '<li id="mapper' + data.userid + '" class="rtMapper littleRtOff">' + data.username + '</li>';
            $('#mapper' + data.userid).remove();
            $('.realtimeMapperList ul').append(mapperListItem);

            Metamaps.Realtime.notifyUser(data.username + ' just joined the map');

            // send this new mapper back your details, and the awareness that you've loaded the map
            var update = {
                userToNotify: data.userid,
                username: username,
                userid: userid,
                userrealtime: goRealtime,
                mapid: Metamaps.Active.Map.id
            };
            socket.emit('updateNewMapperList', update);
        });

        // receive word that a mapper left the map
        socket.on('maps-' + Metamaps.Active.Map.id + '-lostmapper', function (data) {
            // data.userid
            // data.username

            delete MetamapsModel.mappersOnMap[data.userid];

            $('#mapper' + data.userid).remove();

            Metamaps.Realtime.notifyUser(data.username + ' just left the map');
        });

        // receive word that there's a mapper turned on realtime
        socket.on('maps-' + Metamaps.Active.Map.id + '-newrealtime', function (data) {
            // data.userid
            // data.username

            MetamapsModel.mappersOnMap[data.userid].realtime = true;

            $('#mapper' + data.userid).removeClass('littleRtOff').addClass('littleRtOn');

            Metamaps.Realtime.notifyUser(data.username + ' just turned on realtime');
        });

        // receive word that there's a mapper turned on realtime
        socket.on('maps-' + Metamaps.Active.Map.id + '-lostrealtime', function (data) {
            // data.userid
            // data.username

            MetamapsModel.mappersOnMap[data.userid].realtime = false;

            $('#mapper' + data.userid).removeClass('littleRtOn').addClass('littleRtOff');

            Metamaps.Realtime.notifyUser(data.username + ' just turned off realtime');
        });

        socket.on('maps-' + Metamaps.Active.Map.id, function (data) {



            //as long as you weren't the origin of the changes, update your map
            if (data.origin != userid && goRealtime) {
                if (data.resource == 'Topic') {
                    topic = $.parseJSON(data.obj);

                    if (data.action == 'create') {
                        Metamaps.Realtime.addTopicToMap(topic);
                    } else if (data.action == 'update' && Metamaps.Visualize.mGraph.graph.getNode(topic.id) != 'undefined') {
                        Metamaps.Realtime.updateTopicOnMap(topic);
                    } else if (data.action == 'destroy' && Metamaps.Visualize.mGraph.graph.getNode(topic.id) != 'undefined') {
                        hideNode(topic.id)
                    }

                    return;
                } else if (data.resource == 'Synapse') {
                    synapse = $.parseJSON(data.obj);

                    if (data.action == 'create') {
                        Metamaps.Realtime.addSynapseToMap(synapse);
                    } else if (data.action == 'update' &&
                        Metamaps.Visualize.mGraph.graph.getAdjacence(synapse.data.$direction['0'], synapse.data.$direction['1']) != 'undefined') {
                        Metamaps.Realtime.updateSynapseOnMap(synapse);
                    } else if (data.action == 'destroy' &&
                        Metamaps.Visualize.mGraph.graph.getAdjacence(synapse.data.$direction['0'], synapse.data.$direction['1']) != 'undefined') {
                        var edge = Metamaps.Visualize.mGraph.graph.getAdjacence(synapse.data.$direction['0'], synapse.data.$direction['1']);
                        hideEdge(edge);
                    }

                    return;
                }
            }
        });
    },
    sendRealtimeOn: function () {
        // send this new mapper back your details, and the awareness that you're online
        var update = {
            username: username,
            userid: userid,
            mapid: Metamaps.Active.Map.id
        };
        Metamaps.Realtime.socket.emit('notifyStartRealtime', update);
    },
    sendRealtimeOff: function () {
        // send this new mapper back your details, and the awareness that you're online
        var update = {
            username: username,
            userid: userid,
            mapid: Metamaps.Active.Map.id
        };
        Metamaps.Realtime.socket.emit('notifyStopRealtime', update);
    },
    addTopicToMap: function (topic) {
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
        return Metamaps.Visualize.mGraph.labels.plotLabel(Metamaps.Visualize.mGraph.canvas, tempForT, Metamaps.Visualize.mGraph.config);
    },
    updateTopicOnMap: function (topic) {
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
        var k, tempForS, v, wasShowDesc, _ref;
        tempForS = Metamaps.Visualize.mGraph.graph.getAdjacence(synapse.data.$direction[0], synapse.data.$direction[1]);
        wasShowDesc = tempForS.data.$showDesc;
        _ref = synapse.data;
        for (k in _ref) {
            v = _ref[k];
            tempForS.data[k] = v;
        }
        tempForS.data.$showDesc = wasShowDesc;
        if (MetamapsModel.edgecardInUse === synapse.data.$id) {
            editEdge(tempForS, false);
        }
        return Metamaps.Visualize.mGraph.plot();
    }
};
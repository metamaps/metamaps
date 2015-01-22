if (typeof Metamaps === 'undefined') Metamaps = {};

Metamaps.Backbone = {};
Metamaps.Backbone.Map = Backbone.Model.extend({
    urlRoot: '/maps',
    blacklist: ['created_at', 'updated_at', 'user_name', 'contributor_count', 'topic_count', 'synapse_count', 'topics', 'synapses', 'mappings', 'mappers'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
    },
    save: function (key, val, options) {
        
        var attrs;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        var newOptions = options || {};
        var s = newOptions.success;

        newOptions.success = function (model, response, opt) {
            if (s) s(model, response, opt);
            model.trigger('saved');
        };
        return Backbone.Model.prototype.save.call(this, attrs, newOptions);
    },
    initialize: function () {
        this.on('changeByOther', this.updateView);
        this.on('saved', this.savedEvent);
    },
    savedEvent: function() {
        Metamaps.Realtime.sendMapChange(this);
    },
    authorizeToEdit: function (mapper) {
        if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
        else return false;
    },
    authorizePermissionChange: function (mapper) {
        if (mapper && this.get('user_id') === mapper.get('id')) return true;
        else return false;
    },
    getUser: function () {
        return Metamaps.Mapper.get(this.get('user_id'));
    },
    fetchContained: function () {
        var bb = Metamaps.Backbone;
        var that = this;
        var start = function (data) {
            that.set('mappers', new bb.MapperCollection(data.mappers));
            that.set('topics', new bb.TopicCollection(data.topics));
            that.set('synapses', new bb.SynapseCollection(data.synapses));
            that.set('mappings', new bb.MappingCollection(data.mappings));
        };

        var e = $.ajax({
            url: "/maps/" + this.id + "/contains.json",
            success: start,
            error: errorFunc,
            async: false
        });
    },
    getTopics: function () {
        if (!this.get('topics')) {
            this.fetchContained();
        }
        return this.get('topics');
    },
    getSynapses: function () {
        if (!this.get('synapses')) {
            this.fetchContained();
        }
        return this.get('synapses');
    },
    getMappings: function () {
        if (!this.get('mappings')) {
            this.fetchContained();
        }
        return this.get('mappings');
    },
    getMappers: function () {
        if (!this.get('mappers')) {
            this.fetchContained();
        }
        return this.get('mappers');
    },
    attrForCards: function () {
        function capitalize(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        var n = this.get('name');
        var d = this.get('desc');

        var maxNameLength = 32;
        var maxDescLength = 118;
        var truncatedName = n ? (n.length > maxNameLength ? n.substring(0, maxNameLength) + "..." : n) : "";
        var truncatedDesc = d ? (d.length > maxDescLength ? d.substring(0, maxDescLength) + "..." : d) : "";

        var obj = {
            id: this.id,
            name: truncatedName,
            fullName: n,
            desc: truncatedDesc,
            permission: this.get("permission") ? capitalize(this.get("permission")) : "Commons",
            editPermission: this.authorizeToEdit(Metamaps.Active.Mapper) ? 'canEdit' : 'cannotEdit',
            contributor_count_number: '<span class="cCountColor">' + this.get('contributor_count') + '</span>',
            contributor_count_string: this.get('contributor_count') == 1 ? ' contributor' : ' contributors',
            topic_count_number: '<span class="tCountColor">' + this.get('topic_count') + '</span>',
            topic_count_string: this.get('topic_count')  == 1 ? ' topic' : ' topics',
            synapse_count_number: '<span class="sCountColor">' + this.get('synapse_count') + '</span>',
            synapse_count_string: this.get('synapse_count') == 1 ? ' synapse' : ' synapses',
            screenshot: '<img src="' + this.get('screenshot_url') + '" />'
        };
        return obj;
    },
    updateView: function() {
        var map = Metamaps.Active.Map;
        var isActiveMap = this.id === map.id;
        var authorized = map && map.authorizeToEdit(Metamaps.Active.Mapper) ? 'canEditMap' : '';
        var commonsMap = map && map.get('permission') === 'commons' ? 'commonsMap' : '';
        if (isActiveMap) {
            Metamaps.Map.InfoBox.updateNameDescPerm(this.get('name'), this.get('desc'), this.get('permission'));
            this.updateMapWrapper();
        }
    },
    updateMapWrapper: function() {
        var map = Metamaps.Active.Map;
        var isActiveMap = this.id === map.id;
        var authorized = map && map.authorizeToEdit(Metamaps.Active.Mapper) ? 'canEditMap' : '';
        var commonsMap = map && map.get('permission') === 'commons' ? 'commonsMap' : '';
        if (isActiveMap) {
            $('.wrapper').removeClass('canEditMap commonsMap').addClass(authorized + ' ' + commonsMap);
        }
    }
});
Metamaps.Backbone.MapsCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Map,
    initialize: function(models, options) {
        this.id = options.id;
        this.sortBy = options.sortBy;

        if (options.mapperId) {
            this.mapperId = options.mapperId;
        }

        // this.page represents the NEXT page to fetch
        this.page = models.length > 0 ? (models.length < 20 ? "loadedAll" : 2) : 1;
    },
    url: function() {
        if (!this.mapperId) {
            return '/explore/' + this.id + '.json';
        }
        else {
            return '/explore/mapper/' + this.mapperId + '.json';
        }
    },
    comparator: function (a, b) {
        a = a.get(this.sortBy);
        b = b.get(this.sortBy);
        var temp;
        if (this.sortBy === 'name') {
            a = a ? a.toLowerCase() : "";
            b = b ? b.toLowerCase() : "";
        }
        else {
            // this is for updated_at and created_at
            temp = a;
            a = b;
            b = temp;
        }
        return a > b ? 1 : a < b ? -1 : 0;
    },
    getMaps: function () {

        var Metamaps.Backbone = this;

        if (this.page != "loadedAll") {
            var numBefore = this.length;
            this.fetch({
                remove: false,
                data: { page: this.page },
                success: function (collection, response, options) {
                    // you can pass additional options to the event you trigger here as well
                    if (collection.length - numBefore < 20) Metamaps.Backbone.page = "loadedAll";
                    else Metamaps.Backbone.page += 1;
                    Metamaps.Backbone.trigger('successOnFetch');
                },
                error: function (collection, response, options) {
                    // you can pass additional options to the event you trigger here as well
                    Metamaps.Backbone.trigger('errorOnFetch');
                }
            });
        }
        else {
            Metamaps.Backbone.trigger('successOnFetch');
        }
    }
});

Metamaps.Backbone.Mapper = Backbone.Model.extend({
    urlRoot: '/users',
    blacklist: ['created_at', 'updated_at'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
    },
    prepareLiForFilter: function () {
        var li = '';
        li += '<li data-id="' + this.id.toString() + '">';      
        li += '<img src="' + this.get("image") + '" data-id="' + this.id.toString() + '"';
        li += ' alt="' + this.get('name') + '" />';      
        li += '<p>' + this.get('name') + '</p></li>';
        return li;
    }
});
Metamaps.Backbone.MapperCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Mapper,
    url: '/users'
});




Metamaps.Backbone.Metacode = Backbone.Model.extend({
    initialize: function () {
        var image = new Image();
        image.crossOrigin = "Anonymous";
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
Metamaps.Backbone.MetacodeCollection = Backbone.Collection.extend({
    model: this.Metacode,
    url: '/metacodes',
    comparator: function (a, b) {
        a = a.get('name').toLowerCase();
        b = b.get('name').toLowerCase();
        return a > b ? 1 : a < b ? -1 : 0;
    }
});

Metamaps.Backbone.Topic = Backbone.Model.extend({
    urlRoot: '/topics',
    blacklist: ['node', 'created_at', 'updated_at', 'user_name', 'user_image', 'map_count', 'synapse_count'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
    },
    save: function (key, val, options) {
        
        var attrs;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        var newOptions = options || {};
        var s = newOptions.success;

        var permBefore = this.get('permission');

        newOptions.success = function (model, response, opt) {
            if (s) s(model, response, opt);
            model.trigger('saved');

            if (permBefore === 'private' && model.get('permission') !== 'private') {
                model.trigger('noLongerPrivate');
            }
            else if (permBefore !== 'private' && model.get('permission') === 'private') {
                model.trigger('nowPrivate');
            }
        };
        return Backbone.Model.prototype.save.call(this, attrs, newOptions);
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
        
        this.on('changeByOther', this.updateCardView);
        this.on('change', this.updateNodeView);
        this.on('saved', this.savedEvent);
        this.on('nowPrivate', function(){
            var removeTopicData = {
                topicid: this.id
            };

            $(document).trigger(Metamaps.JIT.events.removeTopic, [removeTopicData]);
        });
        this.on('noLongerPrivate', function(){
            var newTopicData = {
                mappingid: this.getMapping().id,
                topicid: this.id
            };

            $(document).trigger(Metamaps.JIT.events.newTopic, [newTopicData]);
        });

        this.on('change:metacode_id', Metamaps.Filter.checkMetacodes, this);

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
        
        if (Metamaps.Active.Map) {
            mapping = this.getMapping();
            node.setData('mapping', mapping);
        }
        
        return node;
    },
    savedEvent: function() {
        Metamaps.Realtime.sendTopicChange(this);
    },
    updateViews: function() {
        var onPageWithTopicCard = Metamaps.Active.Map || Metamaps.Active.Topic;
        var node = this.get('node');
        // update topic card, if this topic is the one open there
        if (onPageWithTopicCard && this == Metamaps.TopicCard.openTopicCard) {
            Metamaps.TopicCard.showCard(node);
        }

        // update the node on the map
        if (onPageWithTopicCard && node) {
            node.name = this.get('name'); 
            Metamaps.Visualize.mGraph.plot();
        }
    },
    updateCardView: function() {
        var onPageWithTopicCard = Metamaps.Active.Map || Metamaps.Active.Topic;
        var node = this.get('node');
        // update topic card, if this topic is the one open there
        if (onPageWithTopicCard && this == Metamaps.TopicCard.openTopicCard) {
            Metamaps.TopicCard.showCard(node);
        }
    },
    updateNodeView: function() {
        var onPageWithTopicCard = Metamaps.Active.Map || Metamaps.Active.Topic;
        var node = this.get('node');

        // update the node on the map
        if (onPageWithTopicCard && node) {
            node.name = this.get('name'); 
            Metamaps.Visualize.mGraph.plot();
        }
    }
});

Metamaps.Backbone.TopicCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Topic,
    url: '/topics'
});

Metamaps.Backbone.Synapse = Backbone.Model.extend({
    urlRoot: '/synapses',
    blacklist: ['edge', 'created_at', 'updated_at'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
    },
    save: function (key, val, options) {
        
        var attrs;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        var newOptions = options || {};
        var s = newOptions.success;

        var permBefore = this.get('permission');

        newOptions.success = function (model, response, opt) {
            if (s) s(model, response, opt);
            model.trigger('saved');

            if (permBefore === 'private' && model.get('permission') !== 'private') {
                model.trigger('noLongerPrivate');
            }
            else if (permBefore !== 'private' && model.get('permission') === 'private') {
                model.trigger('nowPrivate');
            }
        };
        return Backbone.Model.prototype.save.call(this, attrs, newOptions);
    },
    initialize: function () {
        if (this.isNew()) {
            this.set({
                "user_id": Metamaps.Active.Mapper.id,
                "permission": Metamaps.Active.Map ? Metamaps.Active.Map.get('permission') : 'commons',
                "category": "from-to"
            });
        }

        this.on('changeByOther', this.updateCardView);
        this.on('change', this.updateEdgeView);
        this.on('saved', this.savedEvent);
        this.on('noLongerPrivate', function(){
            var newSynapseData = {
                mappingid: this.getMapping().id,
                synapseid: this.id
            };

            $(document).trigger(Metamaps.JIT.events.newSynapse, [newSynapseData]);
        });
        this.on('nowPrivate', function(){
            $(document).trigger(Metamaps.JIT.events.removeSynapse, [{
                synapseid: this.id
            }]);
        });

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
        return Metamaps.Topics.get(this.get('node1_id'));
    },
    getTopic2: function () {
        return Metamaps.Topics.get(this.get('node2_id'));
    },
    getDirection: function () {
        return [
                this.getTopic1().get('node').id,
                this.getTopic2().get('node').id
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
    savedEvent: function() {
        Metamaps.Realtime.sendSynapseChange(this);
    },
    updateViews: function() {
        this.updateCardView();
        this.updateEdgeView();
    },
    updateCardView: function() {
        var onPageWithSynapseCard = Metamaps.Active.Map || Metamaps.Active.Topic;
        var edge = this.get('edge');

        // update synapse card, if this synapse is the one open there
        if (onPageWithSynapseCard && edge == Metamaps.SynapseCard.openSynapseCard) {
            Metamaps.SynapseCard.showCard(edge);
        }
    },
    updateEdgeView: function() {
        var onPageWithSynapseCard = Metamaps.Active.Map || Metamaps.Active.Topic;
        var edge = this.get('edge');

        // update the edge on the map
        if (onPageWithSynapseCard && edge) {
            Metamaps.Visualize.mGraph.plot();
        }
    }
});

Metamaps.Backbone.SynapseCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Synapse,
    url: '/synapses'
});

Metamaps.Backbone.Mapping = Backbone.Model.extend({
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

Metamaps.Backbone.MappingCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Mapping,
    url: '/mappings'
});

//attach collection event listeners
Metamaps.Backbone.attachCollectionEvents = function () {
    
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

Metamaps.Backbone.init = function () {
    
    Metamaps.Metacodes = Metamaps.Metacodes ? new Metamaps.Backbone.MetacodeCollection(Metamaps.Metacodes) : new Metamaps.Backbone.MetacodeCollection();

    Metamaps.Topics = Metamaps.Topics ? new Metamaps.Backbone.TopicCollection(Metamaps.Topics) : new Metamaps.Backbone.TopicCollection();

    Metamaps.Synapses = Metamaps.Synapses ? new Metamaps.Backbone.SynapseCollection(Metamaps.Synapses) : new Metamaps.Backbone.SynapseCollection();

    Metamaps.Mappers = Metamaps.Mappers ? new Metamaps.Backbone.MapperCollection(Metamaps.Mappers) : new Metamaps.Backbone.MapperCollection();

    // this is for topic view
    Metamaps.Creators = Metamaps.Creators ? new Metamaps.Backbone.MapperCollection(Metamaps.Creators) : new Metamaps.Backbone.MapperCollection();

    if (Metamaps.Active.Map) {
        Metamaps.Mappings = Metamaps.Mappings ? new Metamaps.Backbone.MappingCollection(Metamaps.Mappings) : new Metamaps.Backbone.MappingCollection();

        Metamaps.Active.Map = new Metamaps.Backbone.Map(Metamaps.Active.Map);
    }

    if (Metamaps.Active.Topic) Metamaps.Active.Topic = new Metamaps.Backbone.Topic(Metamaps.Active.Topic);

    Metamaps.Backbone.attachCollectionEvents();
};
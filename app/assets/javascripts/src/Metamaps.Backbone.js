Metamaps.Backbone = {};
Metamaps.Backbone.Map = Backbone.Model.extend({
    urlRoot: '/maps',
    blacklist: ['created_at', 'updated_at', 'user_name', 'contributor_count', 'topic_count', 'synapse_count', 'topics', 'synapses', 'mappings', 'mappers'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
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
        }

        $.ajax({
            url: "/maps/" + this.id + "/contains.json",
            success: start,
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
        var obj = {
            id: this.id,
            name: this.get('name'),
            desc: this.get('desc'),
            permission: this.get("permission") ? capitalize(this.get("permission")) : "Commons",
            editPermission: this.authorizeToEdit(Metamaps.Active.Mapper) ? 'canEdit' : 'cannotEdit',
            contributor_count_number: '<span class="cCountColor">' + this.get('contributor_count') + '</span>',
            contributor_count_string: this.get('contributor_count') == 1 ? ' contributor' : ' contributors',
            topic_count_number: '<span class="tCountColor">' + this.get('topic_count') + '</span>',
            topic_count_string: this.get('topic_count')  == 1 ? ' topic' : ' topics',
            synapse_count_number: '<span class="sCountColor">' + this.get('synapse_count') + '</span>',
            synapse_count_string: this.get('synapse_count') == 1 ? ' synapse' : ' synapses',
        };
        return obj;
    }
});
Metamaps.Backbone.MapsCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Map,
    initialize: function(models, options) {
        this.id = options.id;
        this.sortBy = options.sortBy;

        // this.page represents the NEXT page to fetch
        this.page = models.length > 0 ? (models.length < 20 ? "loadedAll" : 2) : 1;
    },
    url: function() {
        return '/explore/' + this.id + '.json';
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

        var self = this;

        if (this.page != "loadedAll") {
            var numBefore = this.length;
            this.fetch({
                remove: false,
                data: { page: this.page },
                success: function (collection, response, options) {
                    // you can pass additional options to the event you trigger here as well
                    if (collection.length - numBefore < 20) self.page = "loadedAll";
                    else self.page += 1;
                    self.trigger('successOnFetch');
                },
                error: function (collection, response, options) {
                    // you can pass additional options to the event you trigger here as well
                    self.trigger('errorOnFetch');
                }
            });
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
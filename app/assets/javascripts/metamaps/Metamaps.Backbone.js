Metamaps.Backbone = {};
Metamaps.Backbone.Map = Backbone.Model.extend({
    urlRoot: '/maps',
    blacklist: ['created_at', 'updated_at'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
    },
    authorizeToEdit: function (mapper) {
        if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
        else return false;
    }
});
Metamaps.Backbone.MapsCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Map,
    url: '/maps'
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
        li += '<img src="/assets/icons/person.png" data-id="' + this.id.toString() + '"';
        li += ' alt="' + this.get('name') + '" />';      
        li += '<p>' + this.get('name') + '</p></li>';
        return li;
    }
});
Metamaps.Backbone.MapperCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Mapper,
    url: '/users'
});
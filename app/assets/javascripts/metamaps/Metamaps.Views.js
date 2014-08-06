(function () {
    Metamaps.Views = {};
    
    Metamaps.Views.MapCard = Backbone.View.extend({

        tagName: "div",

        className: "map",

        events: {
            "click .icon": "open",
            "click .button.edit": "openEditDialog",
            "click .button.delete": "destroy"
        },

        initialize: function () {
            this.listenTo(this.model, "change", this.render);
        },

        render: function () {
                
        }

    });

})();
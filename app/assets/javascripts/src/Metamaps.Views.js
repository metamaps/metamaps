(function () {
    Metamaps.Views = {};

    var initialized = false;
    
Metamaps.Views.init = function () {

    Metamaps.Views.MapCard = Backbone.View.extend({

        template: Hogan.compile( $('#mapCardTemplate').html() ),

        tagName: "div",

        className: "map",

        id: function() {
            return this.model.id;
        },

        initialize: function () {
            this.listenTo(this.model, "change", this.render);
        },

        render: function () {
            this.$el.html( this.template.render(this.model.attrForCards()) );
            return this;
        }

    });

    var mapsWrapper = Backbone.View.extend({

        initialize: function (opts) {
            
        },
        setCollection: function (collection) {
            if (this.collection) this.stopListening(this.collection);
            this.collection = collection;
            this.listenTo(this.collection, 'successOnFetch', this.handleSuccess);
            this.listenTo(this.collection, 'errorOnFetch', this.handleError);
        },
        render: function () {
            
            var that = this;

            this.el.innerHTML = "";

            this.collection.each(function (map) {
                var view = new Metamaps.Views.MapCard({ model: map });

                that.el.appendChild( view.render().el );
            });
            this.$el.append('<div class="clearfloat"></div>');
            var m = Metamaps.Famous.maps.surf;
            m.setContent(this.el);
            setTimeout(function(){ 
                var height = $(that.el).height() + 32 + 56;
                m.setSize([undefined, height]);
            }, 100);

            if (!initialized) {
                m.deploy(m._currTarget);
                initialized = true;
                setTimeout(function(){
                    var height = $(that.el).height() + 32 + 56;
                    m.setSize([undefined, height]);
                }, 100);
            }

            Metamaps.Loading.hide();
            setTimeout(function(){
                var path = Metamaps.currentSection == "" ? "" : "/explore/" + Metamaps.currentPage; 
                Metamaps.Router.navigate(path);
            }, 500);
        },
        handleSuccess: function () {
            this.render();
        },
        handleError: function () {
            console.log('error loading maps!'); //TODO 
        }
    });

    Metamaps.Views.exploreMaps = new mapsWrapper();
};

})();
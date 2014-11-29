(function () {
    Metamaps.Views = {};

    var initialized = false;
    
Metamaps.Views.init = function () {

    Metamaps.Views.MapperCard = Backbone.View.extend({

        template: Hogan.compile( $('#mapperCardTemplate').html() ),

        tagNamea: "div",

        className: "mapper",

        render: function () {
            this.$el.html( this.template.render(this.model) );
            return this;
        }
    });

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
            this.listenTo(this.collection, 'add', this.render);
            this.listenTo(this.collection, 'successOnFetch', this.handleSuccess);
            this.listenTo(this.collection, 'errorOnFetch', this.handleError);
        },
        render: function (mapperObj) {
            
            var that = this;

            this.el.innerHTML = "";

            // in case it is a page where we have to display the mapper card
            if (mapperObj) {
                var view = new Metamaps.Views.MapperCard({ model: mapperObj });

                that.el.appendChild( view.render().el );
            }


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

            clearTimeout(Metamaps.routerTimeoutFunctionIds);
            Metamaps.routerTimeoutId = setTimeout((function(localCurrentPage){ return function(){
                var path = (Metamaps.currentSection == "") ? "" : "/explore/" + localCurrentPage;

                // alter url if for mapper profile page
                if (that.collection && that.collection.mapperId) {
                    path += "/" + that.collection.mapperId;
                }

                Metamaps.Router.navigate(path);
            }})(Metamaps.currentPage), 500);
        },
        handleSuccess: function () {
            var that = this;

            if (this.collection && this.collection.id === "mapper") {
                this.fetchUserThenRender();
            }
            else {
                this.render();
            }
        },
        handleError: function () {
            console.log('error loading maps!'); //TODO 
        },
        fetchUserThenRender: function () {
            var that = this;
            // first load the mapper object and then call the render function
            $.ajax({
                url: "/users/" + this.collection.mapperId + "/details.json",
                success: function (response) {
                    that.render(response);
                },
                error: function () {
                    
                }
            });
        }
    });

    Metamaps.Views.exploreMaps = new mapsWrapper();
};

})();

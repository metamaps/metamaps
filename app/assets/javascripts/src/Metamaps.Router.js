(function () {

    Metamaps.currentPage = "";

    var Router = Backbone.Router.extend({
        routes: {
            "": "home", // #home
            "explore/:section": "explore", // #explore/active
            "maps/:id": "maps" // #maps/7
        },
        home: function () {
            
            if (Metamaps.Active.Mapper) document.title = 'My Maps | Metamaps';
            else document.title = 'Home | Metamaps';

            Metamaps.currentSection = "";
            Metamaps.currentPage = "";
            $('.wrapper').removeClass('mapPage topicPage');

            var classes = Metamaps.Active.Mapper ? "homePage explorePage" : "homePage";
            $('.wrapper').addClass(classes);

            // all this only for the logged in home page
            if (Metamaps.Active.Mapper) {
                
                Metamaps.Famous.yield.hide();
                
                Metamaps.Famous.explore.set('mine');
                Metamaps.Famous.maps.resetScroll(); // sets the scroll back to the top
                Metamaps.Famous.explore.show();

                Metamaps.Famous.maps.show();

                Metamaps.GlobalUI.Search.open();
                Metamaps.GlobalUI.Search.lock();

                Metamaps.Views.exploreMaps.setCollection( Metamaps.Maps.Mine );
                if (Metamaps.Maps.Mine.length === 0) {
                    Metamaps.Maps.Mine.getMaps(); // this will trigger an explore maps render
                }
                else {
                    Metamaps.Views.exploreMaps.render();
                }
            }
            // logged out home page
            else {
                
                Metamaps.Famous.yield.show();
                
                Metamaps.Famous.explore.hide();

                Metamaps.GlobalUI.Search.unlock();
                Metamaps.GlobalUI.Search.close(0, true);

                Metamaps.Famous.maps.hide();
                setTimeout(function(){
                    Metamaps.Router.navigate("");
                }, 500);
            }

            Metamaps.Famous.viz.hide();
            Metamaps.Map.end();
            Metamaps.Topic.end();
            Metamaps.Active.Map = null;
            Metamaps.Active.Topic = null;
        },
        explore: function (section) {
            
            var capitalize = section.charAt(0).toUpperCase() + section.slice(1);
            
            document.title = 'Explore ' + capitalize + ' Maps | Metamaps';

            $('.wrapper').removeClass('homePage mapPage topicPage');
            $('.wrapper').addClass('explorePage');
            
            Metamaps.currentSection = "explore";
            Metamaps.currentPage = section;

            Metamaps.Views.exploreMaps.setCollection( Metamaps.Maps[capitalize] );
            if (Metamaps.Maps[capitalize].length === 0) {
                Metamaps.Loading.show();
                setTimeout(function(){
                    Metamaps.Maps[capitalize].getMaps(); // this will trigger an explore maps render
                }, 300); // wait 300 milliseconds till the other animations are done to do the fetch 
            }
            else {
                Metamaps.Views.exploreMaps.render();
            }

            Metamaps.GlobalUI.Search.open();
            Metamaps.GlobalUI.Search.lock();
            
            Metamaps.Famous.yield.hide();

            Metamaps.Famous.maps.resetScroll(); // sets the scroll back to the top
            Metamaps.Famous.maps.show();
            Metamaps.Famous.explore.set(section);
            Metamaps.Famous.explore.show();

            Metamaps.Famous.viz.hide();
            Metamaps.Map.end();
            Metamaps.Topic.end();
            Metamaps.Active.Map = null;
            Metamaps.Active.Topic = null;
        },
        maps: function (id) {
            
            document.title = 'Map ' + id + ' | Metamaps';
            
            Metamaps.currentSection = "map";
            Metamaps.currentPage = id;

            $('.wrapper').removeClass('homePage explorePage topicPage');
            $('.wrapper').addClass('mapPage');

            Metamaps.Famous.yield.hide();
            Metamaps.Famous.maps.hide();
            Metamaps.Famous.explore.hide();

            // clear the visualization, if there was one, before showing its div again
            if (Metamaps.Visualize.mGraph) {
                Metamaps.Visualize.mGraph.graph.empty();
                Metamaps.Visualize.mGraph.plot();
                Metamaps.JIT.centerMap();
            }
            Metamaps.Famous.viz.show();
            Metamaps.Topic.end();
            Metamaps.Active.Topic = null;

            Metamaps.GlobalUI.Search.unlock();
            Metamaps.GlobalUI.Search.close(0, true);

            Metamaps.Map.end();
            Metamaps.Map.launch(id);
        },
        topics: function (id) {
            
            document.title = 'Topic ' + id + ' | Metamaps';
            
            Metamaps.currentSection = "topic";
            Metamaps.currentPage = id;

            $('.wrapper').removeClass('homePage explorePage mapPage');
            $('.wrapper').addClass('topicPage');

            Metamaps.Famous.yield.hide();
            Metamaps.Famous.maps.hide();
            Metamaps.Famous.explore.hide();

            // clear the visualization, if there was one, before showing its div again
            if (Metamaps.Visualize.mGraph) {
                Metamaps.Visualize.mGraph.graph.empty();
                Metamaps.Visualize.mGraph.plot();
                Metamaps.JIT.centerMap();
            }
            Metamaps.Famous.viz.show();
            Metamaps.Map.end();
            Metamaps.Active.Map = null;

            Metamaps.GlobalUI.Search.unlock();
            Metamaps.GlobalUI.Search.close(0, true);

            Metamaps.Topic.end();
            Metamaps.Topic.launch(id);
        }
    });
    
    Metamaps.Router = new Router();

    Metamaps.Router.init = function () {
        Backbone.history.start({
            silent: true,
            pushState: true,
            root: '/'
        });
        $(document).on("click", "a:not([data-bypass])", function (evt) {
            var segments;

            var href = {
                prop: $(this).prop("href"),
                attr: $(this).attr("href")
            };
            var root = location.protocol + "//" + location.host + Backbone.history.options.root;
            
            if (href.prop && href.prop === root) href.attr = ""
            
            if (href.prop && href.prop.slice(0, root.length) === root) {
                evt.preventDefault();

                segments = href.attr.split('/');
                segments.splice(0,1); // pop off the element created by the first /

                if (href.attr === "") Metamaps.Router.home();
                else {
                    Metamaps.Router[segments[0]](segments[1]);
                }
            }
        });
    }
})();

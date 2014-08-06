(function () {
    var Router = Backbone.Router.extend({
        routes: {
            "": "home", // #home
            "explore/:section": "explore", // #explore/active
            "maps/:id": "maps" // #maps/7
        },
        home: function () {
            
            document.title = 'My Maps | Metamaps';
            $('#cards').show();
        },
        explore: function (section) {
            
            var capitalize = section.charAt(0).toUpperCase() + section.slice(1);
            
            document.title = 'Explore ' + capitalize + ' Maps | Metamaps';
            //$('#cards').hide();
        },
        maps: function (id) {
            
            document.title = 'Map ' + id + ' | Metamaps';
            $('#cards').hide();
        }
    });
    Metamaps.Router = new Router();
    Metamaps.Router.init = function () {
        Backbone.history.start({
            pushState: true,
            root: '/'
        });
        console.log('router started');
        $(document).on("click", "a:not([data-bypass])", function (evt) {
            var href = {
                prop: $(this).prop("href"),
                attr: $(this).attr("href")
            };
            var root = location.protocol + "//" + location.host + Backbone.history.options.root;
            
            if (href.prop && href.prop === root) href.attr = ""
            
            if (href.prop && href.prop.slice(0, root.length) === root) {
                evt.preventDefault();
                Backbone.history.navigate(href.attr, true);
            }
        });
    }
})();

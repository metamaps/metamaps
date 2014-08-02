(function () {
    var Router = Backbone.Router.extend({
        routes: {
            "": "home", // #home
            "explore/:section": "explore", // #explore/active
            "maps/:id": "maps" // #maps/7
        },
        explore: function (section) {
            console.log(section);
        },
        maps: function (id) {
            console.log(id);
        }
    });
    Metamaps.Router = new Router();
    Metamaps.Router.init = function () {
        Backbone.history.start({
            pushState: true,
            root: ''
        });
        console.log('router started');
        $(document).on("click", "a:not([data-bypass])", function (evt) {
            var href = {
                prop: $(this).prop("href"),
                attr: $(this).attr("href")
            };
            var root = location.protocol + "//" + location.host + Backbone.history.options.root;

            if (href.prop && href.prop.slice(0, root.length) === root) {
                evt.preventDefault();
                Backbone.history.navigate(href.attr, true);
            }
        });
    }
})();
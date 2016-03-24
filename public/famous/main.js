define(function(require, exports, module) {

Metamaps.Famous = {};
Metamaps.Famous.build = function () {
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var Timer = require('famous/utilities/Timer');
    var Scrollview = require('famous/views/Scrollview');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var RenderNode = require('famous/core/RenderNode');

    var templates = require('templates');

    // create the main context
    var famous = document.getElementById('famousOverlay');

    var f = Metamaps.Famous;

    f.mainContext = Engine.createContext(famous);
    f.Surface = Surface;
    f.Modifier = Modifier;
    f.Transform = Transform;


    // INFOVIS
    f.viz = {};

    var instructions = {
        addTopic: "Double-click to<br>add a topic!",
        tabKey: "Use Tab & Shift+Tab to select a metacode",
        enterKey: "Press Enter to add the topic"
    };

    f.viz.surf = new Surface({
        size: [undefined, undefined],
        classes: [],
        properties: {
            display: "none",
            zIndex: "1"
        }
    });

    var instrShowing = false;
    f.viz.instrSurf = new Surface({
        content: instructions.addTopic,
        size: [220, 80],
        classes: ["doubleClickSurf"],
        properties: {
            fontFamily: "'din-regular', helvetica, sans-serif",
            fontSize: "32px",
            display: "none",
            textAlign: "center",
            color: "#999999",
            zIndex: "0"
        }
    });
    var prepare = function () {
            f.viz.show();
            Metamaps.JIT.prepareVizData();
            f.viz.surf.removeListener('deploy',prepare);
    };
    if (Metamaps.currentSection === "map" || Metamaps.currentSection === "topic") {
        f.viz.surf.on('deploy', prepare);
    }
    f.viz.mod = new Modifier({
        origin: [0.5, 0.5],
        opacity: 0
    });
    f.viz.show = function () {
        f.viz.surf.setProperties({ "display":"block" });
        f.viz.mod.setOpacity(
            1,
            { duration: 300 }
        );
    };
    f.viz.hide = function () {
        f.viz.mod.setOpacity(
            0, 
            { duration: 300 }, 
            function() {
                f.viz.surf.setProperties({"display": "none"});
            }
        );
    };
    f.viz.isInstrShowing = function() {
        return instrShowing;
    }
    f.viz.showInstructions = function() {
        instrShowing = true;
        f.viz.instrSurf.setProperties({ "display":"block" });
    };
    f.viz.hideInstructions = function() {
        instrShowing = false;
        f.viz.instrSurf.setProperties({ "display":"none" });
    };
    var vizMod = f.mainContext.add(f.viz.mod);
    vizMod.add(f.viz.surf);
    vizMod.add(f.viz.instrSurf);
    
    // CONTENT / OTHER PAGES
    f.yield = {};
    f.yield.surf = new Surface({
        size: [undefined, undefined],
        classes: ['famousYield'],
        properties: {
            display: 'none'
        }
    });
    var loadYield = function () {
            f.loadYield();
            f.yield.surf.removeListener('deploy',loadYield);
    };
    if (!(Metamaps.currentSection === "map" ||
            Metamaps.currentSection === "topic" ||
            Metamaps.currentSection === "explore" ||
            (Metamaps.currentSection === "" && Metamaps.Active.Mapper) )) {
        f.yield.surf.on('deploy', loadYield);
    }
    f.yield.mod = new Modifier({
        origin: [0.5, 0.5],
        opacity: 0
    });
    f.yield.show = function () {
        f.yield.surf.setProperties({ "display":"block" });
        f.yield.mod.setOpacity(
            1,
            { duration: 300 }
        );
    };
    f.yield.hide = function () {
        f.yield.mod.setOpacity(
            0, 
            { duration: 300 }, 
            function() {
                f.yield.surf.setProperties({"display": "none"});
            }
        );
    };
    f.mainContext.add(f.yield.mod).add(f.yield.surf);
    
    f.loadYield = function () {
        Metamaps.Loading.hide();

        var y = document.getElementById('yield');
        var yield = y ? y.innerHTML : false;
        if (yield) {
            f.yield.surf.setContent(yield);
            f.yield.surf.deploy(f.yield.surf._currTarget);
            f.yield.show();

            y.parentNode.removeChild(y);
        }
    };


    // CONTENT / OTHER PAGES
    f.maps = {};
    f.maps.surf = new Surface({
        size: [undefined, true], // this will get set to a specific height later in order to work
        classes: ['mapsWrapper'],
    });
    var mapsContainer = new ContainerSurface({
        size: [undefined, undefined],
        properties: {
            overflow: 'hidden',
        }
    });
    var loadMaps = function () {
            f.loadMaps();
            f.maps.surf.removeListener('deploy',loadMaps);
    };
    if (Metamaps.currentSection === "explore" ||
            (Metamaps.currentSection === "" && Metamaps.Active.Mapper)) {
        f.maps.surf.on('deploy', loadMaps);
    }
    f.maps.mod = new Modifier({
        origin: [0.5, 0],
        opacity: 0,
        transform: Transform.translate(window.innerWidth,94,0)
    });
    f.maps.mod.sizeFrom(function(){
        return [window.innerWidth, window.innerHeight - 94];
    });
    f.maps.show = function () {
        // set into the correct position and then fade in
        f.maps.mod.setTransform(Transform.translate(0, 94, 0));
        f.maps.mod.setOpacity(
            1,
            { duration: 300 }
        );
    };
    f.maps.hide = function () {
        // fade out and then position it offscreen
        f.maps.mod.setOpacity(
            0, 
            { duration: 300 }, 
            function() {
                f.maps.mod.setTransform(Transform.translate(window.innerWidth, 94, 0));
            }
        );
    };
    f.maps.reposition = function () {
        f.maps.mod.setTransform(Transform.translate(window.innerWidth, 94, 0));
    };
    var mapsScroll = new Scrollview();
    f.maps.lock = false;
    mapsScroll._eventInput.on('update', _.throttle(function(data) {
        var bottom = f.maps.surf.getSize()[1], // how far down it goes
            pos = mapsScroll.getPosition(), // how far down you are
            containerSize = f.maps.mod.getSize()[1], // height of the viewable area
            distanceToBottom = bottom - (pos + containerSize),
            triggerDistance = 700;

        if (!f.maps.lock &&
            distanceToBottom < triggerDistance && 
            Metamaps.Views && 
            Metamaps.Views.exploreMaps && 
            Metamaps.Views.exploreMaps.collection &&
            Metamaps.Views.exploreMaps.collection.page != "loadedAll") {
                f.maps.lock = true;
                Metamaps.Views.exploreMaps.collection.getMaps();
        }
    }, 500));
    f.maps.resetScroll = function() {
        // set the scrollView back to the top
        mapsScroll._physicsEngine.detachAll();
        mapsScroll.setVelocity(0);
        mapsScroll.setPosition(0);
    };
    mapsScroll.sequenceFrom([f.maps.surf]);
    f.maps.surf.pipe(mapsScroll);
    mapsContainer.add(mapsScroll);
    var mapsNode = new RenderNode(f.maps.mod);
    mapsNode.add(mapsContainer);
    f.mainContext.add(mapsNode);
    
    f.loadMaps = function () {
        if (Metamaps.currentSection === "explore") {
            var capitalize = Metamaps.currentPage.charAt(0).toUpperCase() + Metamaps.currentPage.slice(1);

            Metamaps.Views.exploreMaps.setCollection( Metamaps.Maps[capitalize] );
            if (Metamaps.currentPage === "mapper") {
                Metamaps.Views.exploreMaps.fetchUserThenRender();
            }
            else {
                Metamaps.Views.exploreMaps.render();
            }
            f.maps.show();
            f.explore.set(Metamaps.currentPage, Metamaps.Maps.Mapper.mapperId);
            f.explore.show();   
        }
        else if (Metamaps.currentSection === "") {
            Metamaps.Loading.hide();
            if (Metamaps.Active.Mapper) {

                Metamaps.Views.exploreMaps.setCollection( Metamaps.Maps.Active );
                Metamaps.Views.exploreMaps.render();
                f.maps.show();
                f.explore.set('active');
                f.explore.show();
            }
            else f.explore.set('featured');
        }
    };
    
    
    // EXPLORE MAPS BAR
    f.explore = {};
    f.explore.surf = new Surface({
        size: [true, 42],
        content: templates.mineContent,
        classes: ['exploreMapsCenter']
    });
    f.explore.surfBg = new Surface({
        size: [undefined, 94],
        content: '<div class="exploreMapsMenu"></div>',
        classes: ['exploreMapsBar', 'exploreElement']
    });
    f.explore.mod = new Modifier({
        size: [undefined, 94],
        origin: [0.5, 0],
        transform: Transform.translate(0, -94, 0)
    });
    f.explore.show = function () {
        f.explore.mod.setTransform(
            Transform.translate(0, 0, 0), 
            { duration: 300, curve: 'easeOut' }
        );
    };
    f.explore.hide = function () {
        f.explore.mod.setTransform(
            Transform.translate(0, -94, 0), 
            { duration: 300, curve: 'easeIn' }
        );
    };
    f.explore.set = function (section, mapperId) {
        var loggedIn = Metamaps.Active.Mapper ? 'Auth' : '';
        

        if (section === "mine" || section === "active" || section === "featured") {
            f.explore.surf.setContent(templates[section + loggedIn + 'Content']);
        }
        else if (section === "mapper") {

            var setMapper = function(mapperObj) {
                var mapperContent;
                mapperContent = "<div class='exploreMapsButton active mapperButton'><img class='exploreMapperImage' width='24' height='24' src='" + mapperObj.image + "' />";
                mapperContent += "<div class='exploreMapperName'>" + mapperObj.name + "'s Maps</div><div class='clearfloat'></div></div>";

                f.explore.surf.setContent(mapperContent);
            };

            $.ajax({
                url: "/users/" + mapperId + ".json",
                success: function (response) {
                    setMapper(response);
                },
                error: function () {
                    
                }
            });
        }
    };
    var exploreMod = f.mainContext.add(f.explore.mod);
    exploreMod.add(new Modifier({
        size: [undefined, 42],
        origin: [0.5, 1]
    })).add(new Modifier({
        origin: [0.5, 1]
    })).add(f.explore.surf);
    exploreMod.add(f.explore.surfBg);


    // LOGO
    f.logo = {};
    f.logo.surf = new Surface({
        size: [258, 56],
        content: templates.logoContent,
        classes: ['footer']
    });

    f.logo.mod = new Modifier({
        origin: [0.5, 1],
        transform: Transform.translate(0, 56, 0)
    });
    f.logo.show = function () {
        f.logo.mod.setTransform(
            Transform.translate(0, 0, 0), 
            { duration: 300, curve: 'easeOut' }
        );
    };
    f.logo.hide = function () {
        f.logo.mod.setTransform(
            Transform.translate(0, 56, 0), 
            { duration: 300, curve: 'easeIn' }
        );
    };
    f.mainContext.add(f.logo.mod).add(f.logo.surf);
    

    // TOAST
    f.toast = {};
    f.toast.surf = new Surface({
        size: [true, 42],
        content: '',
        classes: ['toast']
    });
    initialToast = function () {
        var message = document.getElementById('toast') ? document.getElementById('toast').innerHTML : false;
        if (message) {
            Metamaps.GlobalUI.notifyUser(message);
            f.toast.surf.deploy(f.toast.surf._currTarget);
            f.toast.surf.removeListener('deploy', initialToast);
        }
    };
    f.toast.surf.on('deploy', initialToast);
    f.toast.mod = new Modifier({
        origin: [0, 1],
        opacity: 0,
        transform: Transform.translate(24, -24, 0)
    });
    f.toast.show = function () {
        f.toast.mod.setOpacity(
            1, 
            { duration: 300 }
        );
    };
    f.toast.hide = function () {
        f.toast.mod.setOpacity(
            0, 
            { duration: 300 }
        );
    };
    f.mainContext.add(f.toast.mod).add(f.toast.surf);

    // an object for the realtime mapper compasses surfaces
    f.compasses = {};

    f.logo.show();

}// build
});
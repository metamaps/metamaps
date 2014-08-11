define(function(require, exports, module) {
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var Timer = require('famous/utilities/Timer');

    var templates = require('templates');

    // create the main context
    var famous = document.getElementById('famousOverlay');

    Metamaps.Famous = {};
    var f = Metamaps.Famous;

    f.mainContext = Engine.createContext(famous);


    // INFOVIS
    f.viz = {};
    f.viz.surf = new Surface({
        size: [undefined, undefined],
        classes: [],
        properties: {
            display: 'none'
        }
    });
    var prepare = function () {
            f.viz.show();
            Metamaps.JIT.prepareVizData();
            f.viz.surf.removeListener('deploy',prepare);
    };
    if (Metamaps.currentSection === "map") {
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
    f.mainContext.add(f.viz.mod).add(f.viz.surf);

    
    // CONTENT / OTHER PAGES
    f.yield = {};
    f.yield.surf = new Surface({
        size: [true, true],
        classes: [],
        properties: {
            display: 'none'
        }
    });
    var loadYield = function () {
            f.loadYield();
            f.yield.surf.removeListener('deploy',loadYield);
    };
    if (!(Metamaps.currentSection === "map" ||
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
        Metamaps.Loading.loader.hide();
        var yield = document.getElementById('yield').innerHTML;
        f.yield.surf.setContent(yield);
        f.yield.surf.deploy(f.yield.surf._currTarget);
        f.yield.show();
    };
    
    
    // EXPLORE MAPS BAR
    f.explore = {};
    f.explore.surf = new Surface({
        size: [undefined, 94],
        content: templates.mineContent,
        classes: ['exploreMapsBar', 'exploreElement']
    });
    f.explore.mod = new Modifier({
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
    f.explore.set = function (section) {
        var loggedIn = Metamaps.Active.Mapper ? 'Auth' : '';
        f.explore.surf.setContent(templates[section + loggedIn + 'Content']);
    };
    f.mainContext.add(f.explore.mod).add(f.explore.surf);

    // LOGO
    f.logo = {};
    f.logo.surf = new Surface({
        size: [258, 56],
        content: templates.logoContent,
        classes: []
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

    f.logo.show();
    if (Metamaps.currentSection === "explore") {
        Metamaps.Loading.loader.hide();
        f.explore.set(Metamaps.currentPage);
        f.explore.show();
    }
    else if (Metamaps.currentSection === "") {
        Metamaps.Loading.loader.hide();
        if (Metamaps.Active.Mapper) {
            f.explore.set('mine');
            f.explore.show();
        }
        else f.explore.set('featured');
    }
});
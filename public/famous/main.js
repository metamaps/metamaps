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

    //Metamaps.Views.exploreMaps.collection.getMaps();
    f.loadMaps = function () {
        
    };

}// build
});

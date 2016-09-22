window.Metamaps = window.Metamaps || {}

// TODO everything in this file should be moved into one of the other modules
// Either as a local constant, or as a local constant with a globally available getter/setter

Metamaps.tempNode = null
Metamaps.tempInit = false
Metamaps.tempNode2 = null

Metamaps.Active = Metamaps.Active || {
  Map: null,
  Topic: null,
  Mapper: null
};

Metamaps.Maps = Metamaps.Maps || {}

Metamaps.Settings = {
  embed: false, // indicates that the app is on a page that is optimized for embedding in iFrames on other web pages
  sandbox: false, // puts the app into a mode (when true) where it only creates data locally, and isn't writing it to the database
  colors: {
    background: '#344A58',
    synapses: {
      normal: '#888888',
      hover: '#888888',
      selected: '#FFFFFF'
    },
    topics: {
      selected: '#FFFFFF'
    },
    labels: {
      background: '#18202E',
      text: '#DDD'
    }
  },
}

Metamaps.Touch = {
  touchPos: null, // this stores the x and y values of a current touch event
  touchDragNode: null // this stores a reference to a JIT node that is being dragged
}

Metamaps.Mouse = {
  didPan: false,
  didBoxZoom: false,
  changeInX: 0,
  changeInY: 0,
  edgeHoveringOver: false,
  boxStartCoordinates: false,
  boxEndCoordinates: false,
  synapseStartCoordinates: [],
  synapseEndCoordinates: null,
  lastNodeClick: 0,
  lastCanvasClick: 0,
  DOUBLE_CLICK_TOLERANCE: 300
}

Metamaps.Selected = {
  reset: function () {
    var self = Metamaps.Selected
    self.Nodes = []
    self.Edges = []
  },
  Nodes: [],
  Edges: []
}

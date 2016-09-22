window.Metamaps = window.Metamaps || {}

// TODO eliminate these 5 top-level variables
Metamaps.panningInt = null
Metamaps.tempNode = null
Metamaps.tempInit = false
Metamaps.tempNode2 = null

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

require('./Metamaps.Account')
require('./Metamaps.Admin')
require('./Metamaps.AutoLayout')
require('./Metamaps.Backbone')
require('./Metamaps.Control')
require('./Metamaps.Create')
require('./Metamaps.Debug')
require('./Metamaps.Filter')
require('./Metamaps.GlobalUI')
require('./Metamaps.Import')
require('./Metamaps.JIT')
require('./Metamaps.Listeners')
require('./Metamaps.Map')
require('./Metamaps.Mapper')
require('./Metamaps.Mobile')
require('./Metamaps.Organize')
require('./Metamaps.PasteInput')
require('./Metamaps.Realtime')
require('./Metamaps.Router')
require('./Metamaps.Synapse')
require('./Metamaps.SynapseCard')
require('./Metamaps.Topic')
require('./Metamaps.TopicCard')
require('./Metamaps.Util')
require('./Metamaps.Views')
require('./Metamaps.Visualize')
require('./Metamaps.ReactComponents')

export default window.Metamaps

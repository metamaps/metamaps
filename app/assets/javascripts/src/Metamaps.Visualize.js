/* global Metamaps, $ */
/*
 * Metamaps.Visualize
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.JIT
 *  - Metamaps.Loading
 *  - Metamaps.Metacodes
 *  - Metamaps.Router
 *  - Metamaps.Synapses
 *  - Metamaps.TopicCard
 *  - Metamaps.Topics
 *  - Metamaps.Touch
 *  - Metamaps.Visualize
 */

Metamaps.Visualize = {
  mGraph: null, // a reference to the graph object.
  cameraPosition: null, // stores the camera position when using a 3D visualization
  type: 'ForceDirected', // the type of graph we're building, could be "RGraph", "ForceDirected", or "ForceDirected3D"
  loadLater: false, // indicates whether there is JSON that should be loaded right in the offset, or whether to wait till the first topic is created
  init: function () {
    var self = Metamaps.Visualize
    // disable awkward dragging of the canvas element that would sometimes happen
    $('#infovis-canvas').on('dragstart', function (event) {
      event.preventDefault()
    })

    // prevent touch events on the canvas from default behaviour
    $('#infovis-canvas').bind('touchstart', function (event) {
      event.preventDefault()
      self.mGraph.events.touched = true
    })

    // prevent touch events on the canvas from default behaviour
    $('#infovis-canvas').bind('touchmove', function (event) {
      // Metamaps.JIT.touchPanZoomHandler(event)
    })

    // prevent touch events on the canvas from default behaviour
    $('#infovis-canvas').bind('touchend touchcancel', function (event) {
      lastDist = 0
      if (!self.mGraph.events.touchMoved && !Metamaps.Touch.touchDragNode) Metamaps.TopicCard.hideCurrentCard()
      self.mGraph.events.touched = self.mGraph.events.touchMoved = false
      Metamaps.Touch.touchDragNode = false
    })
  },
  computePositions: function () {
    var self = Metamaps.Visualize,
      mapping

    if (self.type == 'RGraph') {
      var i, l, startPos, endPos, topic, synapse

      self.mGraph.graph.eachNode(function (n) {
        topic = Metamaps.Topics.get(n.id)
        topic.set({ node: n }, { silent: true })
        topic.updateNode()

        n.eachAdjacency(function (edge) {
          if (!edge.getData('init')) {
            edge.setData('init', true)

            l = edge.getData('synapseIDs').length
            for (i = 0; i < l; i++) {
              synapse = Metamaps.Synapses.get(edge.getData('synapseIDs')[i])
              synapse.set({ edge: edge }, { silent: true })
              synapse.updateEdge()
            }
          }
        })

        var pos = n.getPos()
        pos.setc(-200, -200)
      })
      self.mGraph.compute('end')
    } else if (self.type == 'ForceDirected') {
      var i, l, startPos, endPos, topic, synapse

      self.mGraph.graph.eachNode(function (n) {
        topic = Metamaps.Topics.get(n.id)
        topic.set({ node: n }, { silent: true })
        topic.updateNode()
        mapping = topic.getMapping()

        n.eachAdjacency(function (edge) {
          if (!edge.getData('init')) {
            edge.setData('init', true)

            l = edge.getData('synapseIDs').length
            for (i = 0; i < l; i++) {
              synapse = Metamaps.Synapses.get(edge.getData('synapseIDs')[i])
              synapse.set({ edge: edge }, { silent: true })
              synapse.updateEdge()
            }
          }
        })

        startPos = new $jit.Complex(0, 0)
        endPos = new $jit.Complex(mapping.get('xloc'), mapping.get('yloc'))
        n.setPos(startPos, 'start')
        n.setPos(endPos, 'end')
      })
    } else if (self.type == 'ForceDirected3D') {
      self.mGraph.compute()
    }
  },
  /**
   * render does the heavy lifting of creating the engine that renders the graph with the properties we desire
   *
   */
  render: function () {
    var self = Metamaps.Visualize, RGraphSettings, FDSettings

    if (self.type == 'RGraph' && (!self.mGraph || self.mGraph instanceof $jit.ForceDirected)) {
      // clear the previous canvas from #infovis
      $('#infovis').empty()
      
      RGraphSettings = $.extend(true, {}, Metamaps.JIT.ForceDirected.graphSettings)

      $jit.RGraph.Plot.NodeTypes.implement(Metamaps.JIT.ForceDirected.nodeSettings)
      $jit.RGraph.Plot.EdgeTypes.implement(Metamaps.JIT.ForceDirected.edgeSettings)

      RGraphSettings.width = $(document).width()
      RGraphSettings.height = $(document).height()
      RGraphSettings.background = Metamaps.JIT.RGraph.background
      RGraphSettings.levelDistance = Metamaps.JIT.RGraph.levelDistance

      self.mGraph = new $jit.RGraph(RGraphSettings)
    } else if (self.type == 'ForceDirected' && (!self.mGraph || self.mGraph instanceof $jit.RGraph)) {
      // clear the previous canvas from #infovis
      $('#infovis').empty()
      
      FDSettings = $.extend(true, {}, Metamaps.JIT.ForceDirected.graphSettings)

      $jit.ForceDirected.Plot.NodeTypes.implement(Metamaps.JIT.ForceDirected.nodeSettings)
      $jit.ForceDirected.Plot.EdgeTypes.implement(Metamaps.JIT.ForceDirected.edgeSettings)

      FDSettings.width = $('body').width()
      FDSettings.height = $('body').height()

      self.mGraph = new $jit.ForceDirected(FDSettings)
    } else if (self.type == 'ForceDirected3D' && !self.mGraph) {
      // clear the previous canvas from #infovis
      $('#infovis').empty()
      
      // init ForceDirected3D
      self.mGraph = new $jit.ForceDirected3D(Metamaps.JIT.ForceDirected3D.graphSettings)
      self.cameraPosition = self.mGraph.canvas.canvases[0].camera.position
    } else {
      self.mGraph.graph.empty()
    }


    if (self.type == 'ForceDirected' && Metamaps.Active.Mapper) $.post('/maps/' + Metamaps.Active.Map.id + '/events/user_presence')

    function runAnimation () {
      Metamaps.Loading.hide()
      // load JSON data, if it's not empty
      if (!self.loadLater) {
        // load JSON data.
        var rootIndex = 0
        if (Metamaps.Active.Topic) {
          var node = _.find(Metamaps.JIT.vizData, function (node) {
            return node.id === Metamaps.Active.Topic.id
          })
          rootIndex = _.indexOf(Metamaps.JIT.vizData, node)
        }
        self.mGraph.loadJSON(Metamaps.JIT.vizData, rootIndex)
        // compute positions and plot.
        self.computePositions()
        self.mGraph.busy = true
        if (self.type == 'RGraph') {
          self.mGraph.fx.animate(Metamaps.JIT.RGraph.animate)
        } else if (self.type == 'ForceDirected') {
          self.mGraph.animate(Metamaps.JIT.ForceDirected.animateSavedLayout)
        } else if (self.type == 'ForceDirected3D') {
          self.mGraph.animate(Metamaps.JIT.ForceDirected.animateFDLayout)
        }
      }
    }
    // hold until all the needed metacode images are loaded
    // hold for a maximum of 80 passes, or 4 seconds of waiting time
    var tries = 0
    function hold () {
      var unique = _.uniq(Metamaps.Topics.models, function (metacode) { return metacode.get('metacode_id'); }),
        requiredMetacodes = _.map(unique, function (metacode) { return metacode.get('metacode_id'); }),
        loadedCount = 0

      _.each(requiredMetacodes, function (metacode_id) {
        var metacode = Metamaps.Metacodes.get(metacode_id),
          img = metacode ? metacode.get('image') : false

        if (img && (img.complete || (typeof img.naturalWidth !== 'undefined' && img.naturalWidth !== 0))) {
          loadedCount += 1
        }
      })

      if (loadedCount === requiredMetacodes.length || tries > 80) runAnimation()
      else setTimeout(function () { tries++; hold() }, 50)
    }
    hold()

    // update the url now that the map is ready
    clearTimeout(Metamaps.Router.timeoutId)
    Metamaps.Router.timeoutId = setTimeout(function () {
      var m = Metamaps.Active.Map
      var t = Metamaps.Active.Topic

      if (m && window.location.pathname !== '/maps/' + m.id) {
        Metamaps.Router.navigate('/maps/' + m.id)
      }
      else if (t && window.location.pathname !== '/topics/' + t.id) {
        Metamaps.Router.navigate('/topics/' + t.id)
      }
    }, 800)
  }
}; // end Metamaps.Visualize

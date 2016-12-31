/* global $, window */

import { find as _find, indexOf as _indexOf, uniq as _uniq, debounce } from 'lodash'

import $jit from '../patched/JIT'

import Active from './Active'
import DataModel from './DataModel'
import JIT from './JIT'
import Loading from './Loading'
import TopicCard from './Views/TopicCard'
import Util from './Util'

const Visualize = {
  mGraph: null, // a reference to the graph object.
  cameraPosition: null, // stores the camera position when using a 3D visualization
  type: 'ForceDirected', // the type of graph we're building, could be "RGraph", "ForceDirected", or "ForceDirected3D"
  loadLater: false, // indicates whether there is JSON that should be loaded right in the offset, or whether to wait till the first topic is created
  touchDragNode: null,
  init: function(serverData) {
    var self = Visualize

    if (serverData.VisualizeType) self.type = serverData.VisualizeType

    // disable awkward dragging of the canvas element that would sometimes happen
    $('#infovis-canvas').on('dragstart', function(event) {
      event.preventDefault()
    })

    // prevent touch events on the canvas from default behaviour
    $('#infovis-canvas').bind('touchstart', function(event) {
      event.preventDefault()
      self.mGraph.events.touched = true
    })

    // prevent touch events on the canvas from default behaviour
    $('#infovis-canvas').bind('touchmove', function(event) {
      // JIT.touchPanZoomHandler(event)
    })

    // prevent touch events on the canvas from default behaviour
    $('#infovis-canvas').bind('touchend touchcancel', function(event) {
      if (!self.mGraph.events.touchMoved && !Visualize.touchDragNode) TopicCard.hideCurrentCard()
      self.mGraph.events.touched = self.mGraph.events.touchMoved = false
      Visualize.touchDragNode = false
    })
  },
  computePositions: function() {
    const self = Visualize

    if (self.type === 'RGraph') {
      let i
      let l

      self.mGraph.graph.eachNode(function(n) {
        const topic = DataModel.Topics.get(n.id)
        topic.set({ node: n }, { silent: true })
        topic.updateNode()

        n.eachAdjacency(function(edge) {
          if (!edge.getData('init')) {
            edge.setData('init', true)

            l = edge.getData('synapseIDs').length
            for (i = 0; i < l; i++) {
              const synapse = DataModel.Synapses.get(edge.getData('synapseIDs')[i])
              synapse.set({ edge: edge }, { silent: true })
              synapse.updateEdge()
            }
          }
        })

        var pos = n.getPos()
        pos.setc(-200, -200)
      })
      self.mGraph.compute('end')
    } else if (self.type === 'ForceDirected') {
      self.mGraph.graph.eachNode(function(n) {
        const topic = DataModel.Topics.get(n.id)
        topic.set({ node: n }, { silent: true })
        topic.updateNode()
        const mapping = topic.getMapping()

        n.eachAdjacency(function(edge) {
          if (!edge.getData('init')) {
            edge.setData('init', true)

            const l = edge.getData('synapseIDs').length
            for (let i = 0; i < l; i++) {
              const synapse = DataModel.Synapses.get(edge.getData('synapseIDs')[i])
              synapse.set({ edge: edge }, { silent: true })
              synapse.updateEdge()
            }
          }
        })

        const startPos = new $jit.Complex(0, 0)
        const endPos = new $jit.Complex(mapping.get('xloc'), mapping.get('yloc'))
        n.setPos(startPos, 'start')
        n.setPos(endPos, 'end')
      })
    } else if (self.type === 'ForceDirected3D') {
      self.mGraph.compute()
    }
  },
  /**
   * render does the heavy lifting of creating the engine that renders the graph with the properties we desire
   *
   */
  render: function() {
    const self = Visualize

    if (self.type === 'RGraph') {
      // clear the previous canvas from #infovis
      $('#infovis').empty()

      const RGraphSettings = $.extend(true, {}, JIT.ForceDirected.graphSettings)

      $jit.RGraph.Plot.NodeTypes.implement(JIT.ForceDirected.nodeSettings)
      $jit.RGraph.Plot.EdgeTypes.implement(JIT.ForceDirected.edgeSettings)

      RGraphSettings.width = $(document).width()
      RGraphSettings.height = $(document).height()
      RGraphSettings.background = JIT.RGraph.background
      RGraphSettings.levelDistance = JIT.RGraph.levelDistance

      self.mGraph = new $jit.RGraph(RGraphSettings)
    } else if (self.type === 'ForceDirected') {
      // clear the previous canvas from #infovis
      $('#infovis').empty()

      const FDSettings = $.extend(true, {}, JIT.ForceDirected.graphSettings)

      $jit.ForceDirected.Plot.NodeTypes.implement(JIT.ForceDirected.nodeSettings)
      $jit.ForceDirected.Plot.EdgeTypes.implement(JIT.ForceDirected.edgeSettings)

      FDSettings.width = $('body').width()
      FDSettings.height = $('body').height()

      self.mGraph = new $jit.ForceDirected(FDSettings)
    } else if (self.type === 'ForceDirected3D' && !self.mGraph) {
      // clear the previous canvas from #infovis
      $('#infovis').empty()

      // init ForceDirected3D
      self.mGraph = new $jit.ForceDirected3D(JIT.ForceDirected3D.graphSettings)
      self.cameraPosition = self.mGraph.canvas.canvases[0].camera.position
    } else {
      self.mGraph.graph.empty()
    }

    // monkey patch scale function
    const oldScale = self.mGraph.canvas.scale
    const cachedPathname = window.location.pathname
    const updateScaleInUrl = debounce(() => {
      Util.updateQueryParams({ scale: self.mGraph.canvas.scaleOffsetX.toFixed(2) }, cachedPathname)
    }, 200)
    self.mGraph.canvas.scale = function(x, y, disablePlot) {
      const returnValue = oldScale.apply(self.mGraph.canvas, arguments)
      updateScaleInUrl()
      return returnValue
    }

    // monkey patch translate function
    const oldTranslate = self.mGraph.canvas.translate
    const updateTranslateInUrl = debounce(() => {
      const newX = self.mGraph.canvas.translateOffsetX.toFixed(2)
      const newY = self.mGraph.canvas.translateOffsetY.toFixed(2)
      Util.updateQueryParams({ translate: `${newX},${newY}` }, cachedPathname)
    }, 200)
    self.mGraph.canvas.translate = function(x, y, disablePlot) {
      const returnValue = oldTranslate.apply(self.mGraph.canvas, arguments)
      updateTranslateInUrl()
    }

    const queryParams = Util.queryParams()
    const scale = parseFloat(queryParams.scale) || 1.0
    if (typeof queryParams.translate === 'string') {
      const [x, y] = queryParams.translate.split(',').map(n => parseFloat(n) || 0)
      self.mGraph.canvas.translate(x / scale, y / scale)
    }
    if (typeof queryParams.scale === 'string') {
      self.mGraph.canvas.scale(scale, scale)
    }

    function runAnimation() {
      Loading.hide()
      // load JSON data, if it's not empty
      if (!self.loadLater) {
        // load JSON data.
        var rootIndex = 0
        if (Active.Topic) {
          var node = _find(JIT.vizData, function(node) {
            return node.id === Active.Topic.id
          })
          rootIndex = _indexOf(JIT.vizData, node)
        }
        self.mGraph.loadJSON(JIT.vizData, rootIndex)
        // compute positions and plot.
        self.computePositions()
        self.mGraph.busy = true
        if (self.type === 'RGraph') {
          self.mGraph.fx.animate(JIT.RGraph.animate)
        } else if (self.type === 'ForceDirected') {
          self.mGraph.animate(JIT.ForceDirected.animateSavedLayout)
        } else if (self.type === 'ForceDirected3D') {
          self.mGraph.animate(JIT.ForceDirected.animateFDLayout)
        }
      }
    }
    // hold until all the needed metacode images are loaded
    // hold for a maximum of 80 passes, or 4 seconds of waiting time
    var tries = 0
    function hold() {
      const unique = _uniq(DataModel.Topics.models, function(metacode) { return metacode.get('metacode_id') })
      const requiredMetacodes = unique.map(metacode => metacode.get('metacode_id'))
      let loadedCount = 0

      requiredMetacodes.forEach(metacodeId => {
        const metacode = DataModel.Metacodes.get(metacodeId)
        const img = metacode ? metacode.get('image') : false

        if (img && (img.complete || (typeof img.naturalWidth !== 'undefined' && img.naturalWidth !== 0))) {
          loadedCount += 1
        }
      })

      if (loadedCount === requiredMetacodes.length || tries > 80) {
        runAnimation()
      } else {
        setTimeout(function() { tries++; hold() }, 50)
      }
    }
    hold()
  },
  clearVisualization: function() {
    Visualize.mGraph.graph.empty()
    Visualize.mGraph.plot()
    JIT.centerMap(Visualize.mGraph.canvas)
    $('#infovis').empty()
  }
}

export default Visualize

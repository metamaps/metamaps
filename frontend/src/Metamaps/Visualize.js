/* global $ */

import _ from 'lodash'

import $jit from '../patched/JIT'

import Active from './Active'
import DataModel from './DataModel'
import JIT from './JIT'
import Loading from './Loading'
import TopicCard from './Views/TopicCard'

const Visualize = {
  init: function(serverData) {
    var self = Visualize

    $jit.RGraph.Plot.NodeTypes.implement(JIT.ForceDirected.nodeSettings)
    $jit.RGraph.Plot.EdgeTypes.implement(JIT.ForceDirected.edgeSettings)


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
    $('#infovis-canvas').bind('touchend touchcancel', function(event) {
      if (!self.mGraph.events.touchMoved) TopicCard.hideCurrentCard()
      self.mGraph.events.touched = self.mGraph.events.touchMoved = false
    })
  },
  computePositions: function() {
    const self = Visualize

    // for RGraph
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
  },
  /**
   * render does the heavy lifting of creating the engine that renders the graph with the properties we desire
   *
   */
  render: function() {
    const self = Visualize
    const RGraphSettings = $.extend(true, {}, JIT.ForceDirected.graphSettings)
    RGraphSettings.width = $(document).width()
    RGraphSettings.height = $(document).height()
    RGraphSettings.background = JIT.RGraph.background
    RGraphSettings.levelDistance = JIT.RGraph.levelDistance
    self.mGraph = new $jit.RGraph(RGraphSettings)
  }
}

export default Visualize

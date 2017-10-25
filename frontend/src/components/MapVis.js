/* global $ */

import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import $jit from '../patched/JIT'
import JIT from '../Metamaps/JIT'

// There would be separate one of these for mapview and topicview

/*
it could use the diffing intelligently to know when you
update the visualization

// JIT MORPH to move between states?

use componentDidUpdate to check for differences in
- topic list, synapse list, mapping list, etc
- use that info to intelligently update and animate the viz.

basically port everything from VISUALIZE module over into here

it should dynamically generate and pass in callbacks to the visualization
*/

class MapVis extends Component {
  static propTypes = {
    DataModel: PropTypes.object,
    filters: PropTypes.array,
    selectedNodes: PropTypes.array,
    selectedEdges: PropTypes.array,
    onSelect: PropTypes.func,
    onPan: PropTypes.func,
    onZoom: PropTypes.func,
    onDrawSelectBox: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.jitGraph = null
    this.vizData = null
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    $jit.ForceDirected.Plot.NodeTypes.implement(JIT.ForceDirected.nodeSettings)
    $jit.ForceDirected.Plot.EdgeTypes.implement(JIT.ForceDirected.edgeSettings)
  }

  componentDidUpdate(prevProps) {
    const { map, DataModel } = this.props
    const prevMap = prevProps.map
    const prevDataModel = prevProps.DataModel
    if (DataModel) {
      if (map !== prevMap) {
        this.initialize()
      }
    }
  }

  initialize() {
    const { DataModel } = this.props
    this.createJitGraph()
    this.vizData = JIT.convertModelsToJIT(DataModel.Topics, DataModel.Synapses)
    this.waitForMetacodesThenLoad()
  }

  divMounted(div) {
    console.log(div)
  }

  createJitGraph() {
    const FDSettings = $.extend(true, {}, JIT.ForceDirected.graphSettings)
    FDSettings.width = $('body').width()
    FDSettings.height = $('body').height()
    this.jitGraph = new $jit.ForceDirected(FDSettings)
  }

  waitForMetacodesThenLoad() {
    const { DataModel } = this.props
    // hold until all the needed metacode images are loaded
    // hold for a maximum of 80 passes, or 4 seconds of waiting time
    var tries = 0
    const hold = () => {
      const unique = _.uniq(DataModel.Topics.models, function(metacode) { return metacode.get('metacode_id') })
      const requiredMetacodes = _.map(unique, function(metacode) { return metacode.get('metacode_id') })
      let loadedCount = 0

      _.each(requiredMetacodes, function(metacodeId) {
        const metacode = DataModel.Metacodes.get(metacodeId)
        const img = metacode ? metacode.get('image') : false

        if (img && (img.complete || (typeof img.naturalWidth !== 'undefined' && img.naturalWidth !== 0))) {
          loadedCount += 1
        }
      })

      if (loadedCount === requiredMetacodes.length || tries > 80) {
        this.runAnimation()
      } else {
        setTimeout(function() { tries++; hold() }, 50)
      }
    }
    hold()
  }

  computePositions() {
    const { DataModel } = this.props
    this.jitGraph.graph.eachNode(function(n) {
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
  }

  runAnimation() {
    // load JSON data, if it's not empty
    if (this.vizData) {
      // load JSON data.
      var rootIndex = 0
      // 0 is rootIndex
      this.jitGraph.loadJSON(this.vizData, 0)
      // compute positions and plot.
      this.computePositions()
      this.jitGraph.animate(JIT.ForceDirected.animateSavedLayout)
    }
  }

  render() {
    const { loading } = this.state
    // display loading while loading
    return <div id="infovis" ref={this.divMounted} />
  }
}

export default MapVis

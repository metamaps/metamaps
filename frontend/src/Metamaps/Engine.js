//import Matter, { Vector, Sleeping, World, Constraint, Composite, Runner, Common, Body, Bodies, Events } from 'matter-js'
import { last, sortBy, values } from 'lodash'

import $jit from '../patched/JIT'
import { getLayoutForData, X_GRID_SPACE } from '../ConvoAlgo'

import Active from './Active'
import Create from './Create'
import DataModel from './DataModel'
import Mouse from './Mouse'
import JIT from './JIT'
import Visualize from './Visualize'

const Engine = {
  init: (serverData) => {
    
  },
  run: init => {
    if (init) {
      if (Active.Mapper && Object.keys(Visualize.mGraph.graph.nodes).length) {
        Engine.setFocusNode(Engine.findFocusNode(Visualize.mGraph.graph.nodes), true)
      }
    }
  },
  endActiveMap: () => {
    
  },
  runLayout: init => {
    Visualize.mGraph.busy = true
    const synapses = DataModel.Synapses.map(s => s.attributes)
    const topics = DataModel.Topics.map(t => t.attributes)
    const focalNodeId = Create.newSynapse.focusNode.getData('topic').id
    const focalCoords = init ? { x: 0, y: 0 } : Create.newSynapse.focusNode.pos
    const layout = getLayoutForData(topics, synapses, focalNodeId, focalCoords)
    Visualize.mGraph.graph.eachNode(n => {
      let calculatedCoords = layout[n.getData('topic').id]
      const endPos = new $jit.Complex(calculatedCoords.x, calculatedCoords.y)
      n.setPos(endPos, 'end')
    })
    Visualize.mGraph.animate({
      modes: ['linear'],
      transition: $jit.Trans.Quart.easeOut,
      duration: 500,
      onComplete: () => {
        Visualize.mGraph.busy = false
        Create.newSynapse.updateForm()
        Create.newTopic.position()
      }
    })
  },
  findFocusNode: nodes => {
    return last(sortBy(values(nodes), n => new Date(n.getData('topic').get('created_at'))))
  },
  setFocusNode: (node, init, dontRun) => {
    if (!Active.Mapper) return
    Create.newSynapse.focusNode = node
    Mouse.focusNodeCoords = node.pos
    Mouse.newNodeCoords = {
      x: node.pos.x + X_GRID_SPACE,
      y: node.pos.y
    }
    Create.newSynapse.updateForm()
    Create.newTopic.position()
    if (!dontRun) Engine.runLayout(init)
  }
}

export default Engine

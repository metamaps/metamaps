//import Matter, { Vector, Sleeping, World, Constraint, Composite, Runner, Common, Body, Bodies, Events } from 'matter-js'
import { last, sortBy, values } from 'lodash'

import $jit from '../patched/JIT'
import { getLayoutForData } from '../ConvoAlgo'

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
    const synapses = DataModel.Synapses.map(s => s.attributes)
    const topics = DataModel.Topics.map(t => t.attributes)
    const focalNodeId = Create.newSynapse.focusNode.getData('topic').id
    const focalCoords = init ? { x: 0, y: 0 } : Create.newSynapse.focusNode.pos
    const layout = getLayoutForData(topics, synapses, focalNodeId, focalCoords)
    Visualize.mGraph.graph.eachNode(n => {
      let calculatedCoords = layout[n.id]
      if (!calculatedCoords) {
        calculatedCoords = {x: 0, y: 0}
      }
      const endPos = new $jit.Complex(calculatedCoords.x, calculatedCoords.y)
      n.setPos(endPos, 'end')
    })
    Visualize.mGraph.animate({
      modes: ['linear'],
      transition: $jit.Trans.Elastic.easeOut,
      duration: 200,
      onComplete: () => {}
    })
  },
  addNode: node => {
    //Engine.runLayout()
  },
  removeNode: node => { 
    //Engine.runLayout()
  },
  findFocusNode: nodes => {
    return last(sortBy(values(nodes), n => new Date(n.getData('topic').get('created_at'))))
  },
  setFocusNode: (node, init) => {
    if (!Active.Mapper) return
    Create.newSynapse.focusNode = node
    Mouse.focusNodeCoords = node.pos
    Mouse.newNodeCoords = {
      x: node.pos.x + 200,
      y: node.pos.y
    }
    Create.newSynapse.updateForm()
    Create.newTopic.position()
    Engine.runLayout(init)
  },
  addEdge: edge => {
    Engine.runLayout()
  },
  removeEdge: edge => {
    //Engine.runLayout()
  }
}

export default Engine

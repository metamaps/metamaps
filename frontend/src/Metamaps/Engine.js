import Matter, { Vector, Sleeping, World, Constraint, Composite, Runner, Common, Body, Bodies, Events } from 'matter-js'

import $jit from '../patched/JIT'

import Create from './Create'
import DataModel from './DataModel'
import JIT from './JIT'
import Visualize from './Visualize'

const Engine = {
  init: () => {
    Engine.engine = Matter.Engine.create() 
    Events.on(Engine.engine, 'afterUpdate', Engine.callUpdate)
    Engine.engine.world.gravity.scale = 0
  },
  run: init => {
    if (init) {
      Visualize.mGraph.graph.eachNode(Engine.addNode)
      DataModel.Synapses.each(s => Engine.addEdge(s.get('edge')))
    }
    Engine.runner = Matter.Runner.run(Engine.engine)
  },
  endActiveMap: () => {
    Runner.stop(Engine.runner)
    Matter.Engine.clear(Engine.engine)
  },
  setNodePos: (id, x, y) => {
    const body = Composite.get(Engine.engine.world, id, 'body')
    Body.setPosition(body, { x, y }) 
    Body.setVelocity(body, Vector.create(0, 0))
    Body.setAngularVelocity(body, 0)
    Body.setAngle(body, 0)
  },
  setNodeSleeping: (id, isSleeping) => { 
    const body = Composite.get(Engine.engine.world, id, 'body')
    Sleeping.set(body, isSleeping)
    if (!isSleeping) {
      Body.setVelocity(body, Vector.create(0, 0))
      Body.setAngularVelocity(body, 0)
      Body.setAngle(body, 0)
    }
  },
  addNode: node => {
    let body = Bodies.circle(node.pos.x, node.pos.y, 100)
    body.node_id = node.id 
    node.setData('body_id', body.id)
    World.addBody(Engine.engine.world, body)
  },
  removeNode: node => { 

  },
  addEdge: edge => {
    const bodyA = Composite.get(Engine.engine.world, edge.nodeFrom.getData('body_id'), 'body')   
    const bodyB = Composite.get(Engine.engine.world, edge.nodeTo.getData('body_id'), 'body')   
    let constraint = Constraint.create({
      bodyA,
      bodyB,
      length: JIT.ForceDirected.graphSettings.levelDistance,
      stiffness: 0.2
    })
    edge.setData('constraint_id', constraint.id)
    World.addConstraint(Engine.engine.world, constraint)
  },
  removeEdge: synapse => {

  },
  callUpdate: () => {
    Engine.engine.world.bodies.forEach(b => {
      const node = Visualize.mGraph.graph.getNode(b.node_id)
      const newPos = new $jit.Complex(b.position.x, b.position.y)
      node && node.setPos(newPos, 'current')
    })
    Create.newSynapse.updateForm() 
    Visualize.mGraph.plot()
  }
}

export default Engine

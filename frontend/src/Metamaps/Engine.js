import Matter, { World, Composite, Runner, Common, Body, Bodies, Events } from 'matter-js'

import $jit from '../patched/JIT'

import DataModel from './DataModel'
import Visualize from './Visualize'

const Engine = {
  init: () => {
    Engine.engine = Matter.Engine.create() 
    Events.on(Engine.engine, 'afterUpdate', Engine.callUpdate)
    Engine.engine.world.gravity.scale = 0
  },
  run: init => {
    if (init) DataModel.Mappings.each(Engine.addTopic) 
    Engine.runner = Matter.Runner.run(Engine.engine)
  },
  endActiveMap: () => {
    Runner.stop(Engine.runner)
    Matter.Engine.clear(Engine.engine)
  },
  setTopicPos: (id, x, y) => {
    const body = Composite.get(Engine.engine.world, id, 'body')
    Body.setPosition(body, { x, y }) 
  },
  addTopic: mapping => {
    let body = Bodies.circle(mapping.get('xloc'), mapping.get('yloc'), 25)
    body.topic_id = mapping.get('mappable_id')
    DataModel.Topics.get(body.topic_id).get('node').setData('body_id', body.id)
    World.addBody(Engine.engine.world, body)
  },
  removeTopic: mapping => { 

  },
  callUpdate: () => {
    Engine.engine.world.bodies.forEach(b => {
      const node = DataModel.Topics.get(b.topic_id).get('node')
      const newPos = new $jit.Complex(b.position.x, b.position.y)
      node.setPos(newPos, 'current')
    })
    Visualize.mGraph.plot()
  }
}

export default Engine

/* global $, ActionCable */

import { indexOf } from 'lodash'
import ActionCable from 'action-cable-node'

import Active from './Active'
import Control from './Control'
import config from '../config'
import DataModel from './DataModel'
import Map from './Map'
import Mapper from './Mapper'
import Synapse from './Synapse'
import Topic from './Topic'
import { ChatView } from './Views'
import Visualize from './Visualize'

const Cable = {
  init: () => {
    let self = Cable
    self.cable = ActionCable.createConsumer(config.ACTIONCABLE)
  },
  subscribeToMap: id => {
    let self = Cable
    self.sub = self.cable.subscriptions.create({
      channel: 'MapChannel',
      id: id
    }, {
      received: event => self[event.type](event)
    })
  },
  unsubscribeFromMap: () => {
    let self = Cable
    self.sub.unsubscribe()
    delete self.sub
  },
  synapseAdded: event => {
    // we receive contentless models from the server
    // containing only the information we need to determine whether the active mapper
    // can view this synapse and the two topics it connects,
    // then if we determine it can, we make a call for the full model
    const m = Active.Mapper
    const s = new DataModel.Synapse(event.synapse)
    const t1 = new DataModel.Topic(event.topic1)
    const t2 = new DataModel.Topic(event.topic2)

    if (t1.authorizeToShow(m) && t2.authorizeToShow(m) && s.authorizeToShow(m) && !DataModel.Synapses.get(event.synapse.id)) {
      // refactor the heck outta this, its adding wicked wait time
      var topic1, topic2, node1, node2, synapse, mapping, cancel, mapper

      const waitThenRenderSynapse = () => {
        if (synapse && mapping && mapper) {
          topic1 = synapse.getTopic1()
          node1 = topic1.get('node')
          topic2 = synapse.getTopic2()
          node2 = topic2.get('node')

          Synapse.renderSynapse(mapping, synapse, node1, node2, false)
        } else if (!cancel) {
          setTimeout(waitThenRenderSynapse, 10)
        }
      }

      mapper = DataModel.Mappers.get(event.synapse.user_id)
      if (mapper === undefined) {
        Mapper.get(event.synapse.user_id, function(m) {
          DataModel.Mappers.add(m)
          mapper = m
        })
      }
      $.ajax({
        url: '/synapses/' + event.synapse.id + '.json',
        success: function(response) {
          DataModel.Synapses.add(response)
          synapse = DataModel.Synapses.get(response.id)
        },
        error: function() {
          cancel = true
        }
      })
      $.ajax({
        url: '/mappings/' + event.mapping_id + '.json',
        success: function(response) {
          DataModel.Mappings.add(response)
          mapping = DataModel.Mappings.get(response.id)
        },
        error: function() {
          cancel = true
        }
      })
      waitThenRenderSynapse()
    }
  },
  synapseUpdated: event => {
    // TODO: handle case where permission changed
    var synapse = DataModel.Synapses.get(event.id)
    if (synapse) {
      // edge reset necessary because fetch causes model reset
      var edge = synapse.get('edge')
      synapse.fetch({
        success: function(model) {
          model.set({ edge: edge })
          model.trigger('changeByOther')
        }
      })
    }
  },
  synapseRemoved: event => {
    var synapse = DataModel.Synapses.get(event.id)
    if (synapse) {
      var edge = synapse.get('edge')
      var mapping = synapse.getMapping()
      if (edge.getData('mappings').length - 1 === 0) {
        Control.hideEdge(edge)
      }

      var index = indexOf(edge.getData('synapses'), synapse)
      edge.getData('mappings').splice(index, 1)
      edge.getData('synapses').splice(index, 1)
      if (edge.getData('displayIndex')) {
        delete edge.data.$displayIndex
      }
      DataModel.Synapses.remove(synapse)
      DataModel.Mappings.remove(mapping)
    }
  },
  topicAdded: event => {
    const m = Active.Mapper
    // we receive a contentless model from the server
    // containing only the information we need to determine whether the active mapper
    // can view this topic, then if we determine it can, we make a call for the full model
    const t = new DataModel.Topic(event.topic)

    if (t.authorizeToShow(m) && !DataModel.Topics.get(event.topic.id)) {
      // refactor the heck outta this, its adding wicked wait time
      var topic, mapping, mapper, cancel

      const waitThenRenderTopic = () => {
        if (topic && mapping && mapper) {
          Topic.renderTopic(mapping, topic, false, false)
        } else if (!cancel) {
          setTimeout(waitThenRenderTopic, 10)
        }
      }

      mapper = DataModel.Mappers.get(event.topic.user_id)
      if (mapper === undefined) {
        Mapper.get(event.topic.user_id, function(m) {
          DataModel.Mappers.add(m)
          mapper = m
        })
      }
      $.ajax({
        url: '/topics/' + event.topic.id + '.json',
        success: function(response) {
          DataModel.Topics.add(response)
          topic = DataModel.Topics.get(response.id)
        },
        error: function() {
          cancel = true
        }
      })
      $.ajax({
        url: '/mappings/' + event.mapping_id + '.json',
        success: function(response) {
          DataModel.Mappings.add(response)
          mapping = DataModel.Mappings.get(response.id)
        },
        error: function() {
          cancel = true
        }
      })
      waitThenRenderTopic()
    }
  },
  topicUpdated: event => {
    // TODO: handle case where permission changed
    var topic = DataModel.Topics.get(event.id)
    if (topic) {
      var node = topic.get('node')
      topic.fetch({
        success: function(model) {
          model.set({ node: node })
          model.trigger('changeByOther')
        }
      })
    }
  },
  topicMoved: event => {
    var topic, node, mapping
    if (Active.Map) {
      topic = DataModel.Topics.get(event.id)
      mapping = DataModel.Mappings.get(event.mapping_id)
      mapping.set('xloc', event.x)
      mapping.set('yloc', event.y)
      if (topic) node = topic.get('node')
      if (node) node.pos.setc(event.x, event.y)
      Visualize.mGraph.plot()
    }
  },
  topicRemoved: event => {
    var topic = DataModel.Topics.get(event.id)
    if (topic) {
      var node = topic.get('node')
      var mapping = topic.getMapping()
      Control.hideNode(node.id)
      DataModel.Topics.remove(topic)
      DataModel.Mappings.remove(mapping)
    }
  },
  messageCreated: event => {
    if (Active.Mapper && Active.Mapper.id === event.message.user_id) return
    ChatView.addMessages(new DataModel.MessageCollection(event.message))
  },
  mapUpdated: event => {
    var map = Active.Map
    var couldEditBefore = map.authorizeToEdit(Active.Mapper)
    var idBefore = map.id
    map.fetch({
      success: function(model, response) {
        var idNow = model.id
        var canEditNow = model.authorizeToEdit(Active.Mapper)
        if (idNow !== idBefore) {
          Map.leavePrivateMap() // this means the map has been changed to private
        } else if (couldEditBefore && !canEditNow) {
          Map.cantEditNow()
        } else if (!couldEditBefore && canEditNow) {
          Map.canEditNow()
        } else {
          model.trigger('changeByOther')
        }
      }
    })
  }
}

export default Cable

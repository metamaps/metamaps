/* global Metamaps, $ */

import $jit from '../patched/JIT'

import Active from './Active'
import AutoLayout from './AutoLayout'
import Create from './Create'
import Filter from './Filter'
import GlobalUI from './GlobalUI'
import JIT from './JIT'
import Map from './Map'
import Router from './Router'
import Selected from './Selected'
import Settings from './Settings'
import SynapseCard from './SynapseCard'
import TopicCard from './TopicCard'
import Util from './Util'
import Visualize from './Visualize'


/*
 * Metamaps.Topic.js.erb
 *
 * Dependencies:
 *  - Metamaps.Backbone
 *  - Metamaps.Creators
 *  - Metamaps.Mappings
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 */
const noOp = () => {}
const Topic = {
  // this function is to retrieve a topic JSON object from the database
  // @param id = the id of the topic to retrieve
  get: function (id, callback = noOp) {
    // if the desired topic is not yet in the local topic repository, fetch it
    if (Metamaps.Topics.get(id) == undefined) {
      $.ajax({
        url: '/topics/' + id + '.json',
        success: function (data) {
          Metamaps.Topics.add(data)
          callback(Metamaps.Topics.get(id))
        }
      })
    } else callback(Metamaps.Topics.get(id))
  },
  launch: function (id) {
    var bb = Metamaps.Backbone
    var start = function (data) {
      Active.Topic = new bb.Topic(data.topic)
      Metamaps.Creators = new bb.MapperCollection(data.creators)
      Metamaps.Topics = new bb.TopicCollection([data.topic].concat(data.relatives))
      Metamaps.Synapses = new bb.SynapseCollection(data.synapses)
      Metamaps.Backbone.attachCollectionEvents()

      document.title = Active.Topic.get('name') + ' | Metamaps'

      // set filter mapper H3 text
      $('#filter_by_mapper h3').html('CREATORS')

      // build and render the visualization
      Visualize.type = 'RGraph'
      JIT.prepareVizData()

      // update filters
      Filter.reset()

      // reset selected arrays
      Selected.reset()

      // these three update the actual filter box with the right list items
      Filter.checkMetacodes()
      Filter.checkSynapses()
      Filter.checkMappers()
      
      // for mobile
      $('#header_content').html(Active.Topic.get('name'))
    }

    $.ajax({
      url: '/topics/' + id + '/network.json',
      success: start
    })
  },
  end: function () {
    if (Active.Topic) {
      $('.rightclickmenu').remove()
      TopicCard.hideCard()
      SynapseCard.hideCard()
      Filter.close()
    }
  },
  centerOn: function (nodeid, callback) {
    // don't clash with fetchRelatives
    if (!Visualize.mGraph.busy) {
      Visualize.mGraph.onClick(nodeid, {
        hideLabels: false,
        duration: 1000,
        onComplete: function () {
          if (callback) callback()
        }
      })
      Router.navigate('/topics/' + nodeid)
      Active.Topic = Metamaps.Topics.get(nodeid)
    }
  },
  fetchRelatives: function (nodes, metacode_id) {
    var self = this

    var node = $.isArray(nodes) ? nodes[0] : nodes

    var topics = Metamaps.Topics.map(function (t) { return t.id })
    var topics_string = topics.join()

    var creators = Metamaps.Creators.map(function (t) { return t.id })
    var creators_string = creators.join()

    var topic = node.getData('topic')

    var successCallback;
    successCallback = function (data) {
      if (Visualize.mGraph.busy) {
        // don't clash with centerOn
        window.setTimeout(function() { successCallback(data) }, 100)
        return
      }
      if (data.creators.length > 0) Metamaps.Creators.add(data.creators)
      if (data.topics.length > 0) Metamaps.Topics.add(data.topics)
      if (data.synapses.length > 0) Metamaps.Synapses.add(data.synapses)

      var topicColl = new Metamaps.Backbone.TopicCollection(data.topics)
      topicColl.add(topic)
      var synapseColl = new Metamaps.Backbone.SynapseCollection(data.synapses)

      var graph = JIT.convertModelsToJIT(topicColl, synapseColl)[0]
      Visualize.mGraph.op.sum(graph, {
        type: 'fade',
        duration: 500,
        hideLabels: false
      })

      var i, l, t, s

      Visualize.mGraph.graph.eachNode(function (n) {
        t = Metamaps.Topics.get(n.id)
        t.set({ node: n }, { silent: true })
        t.updateNode()

        n.eachAdjacency(function (edge) {
          if (!edge.getData('init')) {
            edge.setData('init', true)

            l = edge.getData('synapseIDs').length
            for (i = 0; i < l; i++) {
              s = Metamaps.Synapses.get(edge.getData('synapseIDs')[i])
              s.set({ edge: edge }, { silent: true })
              s.updateEdge()
            }
          }
        })
      })
      if ($.isArray(nodes) && nodes.length > 1) {
        self.fetchRelatives(nodes.slice(1), metacode_id)
      }
    }

    var paramsString = metacode_id ? 'metacode=' + metacode_id + '&' : ''
    paramsString += 'network=' + topics_string + '&creators=' + creators_string

    $.ajax({
      type: 'GET',
      url: '/topics/' + topic.id + '/relatives.json?' + paramsString,
      success: successCallback,
      error: function () {}
    })
  },

  // opts is additional options in a hash
  // TODO: move createNewInDB and permitCreateSynapseAfter into opts
  renderTopic: function (mapping, topic, createNewInDB, permitCreateSynapseAfter, opts = {}) {
    var self = Topic

    var nodeOnViz, tempPos

    var newnode = topic.createNode()

    var midpoint = {}, pixelPos

    if (!$.isEmptyObject(Visualize.mGraph.graph.nodes)) {
      Visualize.mGraph.graph.addNode(newnode)
      nodeOnViz = Visualize.mGraph.graph.getNode(newnode.id)
      topic.set('node', nodeOnViz, {silent: true})
      topic.updateNode() // links the topic and the mapping to the node

      nodeOnViz.setData('dim', 1, 'start')
      nodeOnViz.setData('dim', 25, 'end')
      if (Visualize.type === 'RGraph') {
        tempPos = new $jit.Complex(mapping.get('xloc'), mapping.get('yloc'))
        tempPos = tempPos.toPolar()
        nodeOnViz.setPos(tempPos, 'current')
        nodeOnViz.setPos(tempPos, 'start')
        nodeOnViz.setPos(tempPos, 'end')
      } else if (Visualize.type === 'ForceDirected') {
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'current')
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'start')
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'end')
      }
      if (Create.newTopic.addSynapse && permitCreateSynapseAfter) {
        Create.newSynapse.topic1id = JIT.tempNode.getData('topic').id

        // position the form
        midpoint.x = JIT.tempNode.pos.getc().x + (nodeOnViz.pos.getc().x - JIT.tempNode.pos.getc().x) / 2
        midpoint.y = JIT.tempNode.pos.getc().y + (nodeOnViz.pos.getc().y - JIT.tempNode.pos.getc().y) / 2
        pixelPos = Util.coordsToPixels(midpoint)
        $('#new_synapse').css('left', pixelPos.x + 'px')
        $('#new_synapse').css('top', pixelPos.y + 'px')
        // show the form
        Create.newSynapse.open()
        Visualize.mGraph.fx.animate({
          modes: ['node-property:dim'],
          duration: 500,
          onComplete: function () {
            JIT.tempNode = null
            JIT.tempNode2 = null
            JIT.tempInit = false
          }
        })
      } else {
        Visualize.mGraph.fx.plotNode(nodeOnViz, Visualize.mGraph.canvas)
        Visualize.mGraph.fx.animate({
          modes: ['node-property:dim'],
          duration: 500,
          onComplete: function () {}
        })
      }
    } else {
      Visualize.mGraph.loadJSON(newnode)
      nodeOnViz = Visualize.mGraph.graph.getNode(newnode.id)
      topic.set('node', nodeOnViz, {silent: true})
      topic.updateNode() // links the topic and the mapping to the node

      nodeOnViz.setData('dim', 1, 'start')
      nodeOnViz.setData('dim', 25, 'end')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'current')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'start')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'end')
      Visualize.mGraph.fx.plotNode(nodeOnViz, Visualize.mGraph.canvas)
      Visualize.mGraph.fx.animate({
        modes: ['node-property:dim'],
        duration: 500,
        onComplete: function () {}
      })
    }

    var mappingSuccessCallback = function (mappingModel, response, topicModel) {
      var newTopicData = {
        mappingid: mappingModel.id,
        mappableid: mappingModel.get('mappable_id')
      }

      $(document).trigger(JIT.events.newTopic, [newTopicData])
      // call a success callback if provided
      if (opts.success) {
        opts.success(topicModel)
      }
    }
    var topicSuccessCallback = function (topicModel, response) {
      if (Active.Map) {
        mapping.save({ mappable_id: topicModel.id }, {
          success: function (model, response) {
            mappingSuccessCallback(model, response, topicModel)
          },
          error: function (model, response) {
            console.log('error saving mapping to database')
          }
        })
      }

      if (Create.newTopic.addSynapse) {
        Create.newSynapse.topic2id = topicModel.id
      }
    }

    if (!Settings.sandbox && createNewInDB) {
      if (topic.isNew()) {
        topic.save(null, {
          success: topicSuccessCallback,
          error: function (model, response) {
            console.log('error saving topic to database')
          }
        })
      } else if (!topic.isNew() && Active.Map) {
        mapping.save(null, {
          success: mappingSuccessCallback
        })
      }
    }
  },
  createTopicLocally: function () {
    var self = Topic

    if (Create.newTopic.name === '') {
      GlobalUI.notifyUser('Please enter a topic title...')
      return
    }

    // hide the 'double-click to add a topic' message
    GlobalUI.hideDiv('#instructions')

    $(document).trigger(Map.events.editedByActiveMapper)

    var metacode = Metamaps.Metacodes.get(Create.newTopic.metacode)

    var topic = new Metamaps.Backbone.Topic({
      name: Create.newTopic.name,
      metacode_id: metacode.id,
      defer_to_map_id: Active.Map.id
    })
    Metamaps.Topics.add(topic)

    if (Create.newTopic.pinned) {
      var nextCoords = AutoLayout.getNextCoord({ mappings: Metamaps.Mappings })
    }
    var mapping = new Metamaps.Backbone.Mapping({
      xloc: nextCoords ? nextCoords.x : Create.newTopic.x,
      yloc: nextCoords ? nextCoords.y : Create.newTopic.y,
      mappable_id: topic.cid,
      mappable_type: 'Topic',
    })
    Metamaps.Mappings.add(mapping)

    // these can't happen until the value is retrieved, which happens in the line above
    Create.newTopic.hide()

    self.renderTopic(mapping, topic, true, true) // this function also includes the creation of the topic in the database
  },
  getTopicFromAutocomplete: function (id) {
    var self = Topic

    $(document).trigger(Map.events.editedByActiveMapper)

    Create.newTopic.hide()

    self.get(id, (topic) => {
      if (Create.newTopic.pinned) {
        var nextCoords = AutoLayout.getNextCoord({ mappings: Metamaps.Mappings })
      }
      var mapping = new Metamaps.Backbone.Mapping({
        xloc: nextCoords ? nextCoords.x : Create.newTopic.x,
        yloc: nextCoords ? nextCoords.y : Create.newTopic.y,
        mappable_type: 'Topic',
        mappable_id: topic.id,
      })
      Metamaps.Mappings.add(mapping)

      self.renderTopic(mapping, topic, true, true)
    })
  },
  getTopicFromSearch: function (event, id) {
    var self = Topic

    $(document).trigger(Map.events.editedByActiveMapper)

    self.get(id, (topic) => {
      var nextCoords = AutoLayout.getNextCoord({ mappings: Metamaps.Mappings })
      var mapping = new Metamaps.Backbone.Mapping({
        xloc: nextCoords.x,
        yloc: nextCoords.y,
        mappable_type: 'Topic',
        mappable_id: topic.id,
      })
      Metamaps.Mappings.add(mapping)
      self.renderTopic(mapping, topic, true, true)
      GlobalUI.notifyUser('Topic was added to your map!')
    })

    event.stopPropagation()
    event.preventDefault()
    return false
  }
}

export default Topic

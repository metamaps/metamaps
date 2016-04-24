/* global Metamaps, $ */

/*
 * Metamaps.Topic.js.erb
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.Backbone
 *  - Metamaps.Backbone
 *  - Metamaps.Create
 *  - Metamaps.Creators
 *  - Metamaps.Famous
 *  - Metamaps.Filter
 *  - Metamaps.GlobalUI
 *  - Metamaps.JIT
 *  - Metamaps.Mappings
 *  - Metamaps.Selected
 *  - Metamaps.Settings
 *  - Metamaps.SynapseCard
 *  - Metamaps.Synapses
 *  - Metamaps.TopicCard
 *  - Metamaps.Topics
 *  - Metamaps.Util
 *  - Metamaps.Visualize
 *  - Metamaps.tempInit
 *  - Metamaps.tempNode
 *  - Metamaps.tempNode2
 */

Metamaps.Topic = {
  // this function is to retrieve a topic JSON object from the database
  // @param id = the id of the topic to retrieve
  get: function (id, callback) {
    // if the desired topic is not yet in the local topic repository, fetch it
    if (Metamaps.Topics.get(id) == undefined) {
      // console.log("Ajax call!")
      if (!callback) {
        var e = $.ajax({
          url: '/topics/' + id + '.json',
          async: false
        })
        Metamaps.Topics.add($.parseJSON(e.responseText))
        return Metamaps.Topics.get(id)
      } else {
        return $.ajax({
          url: '/topics/' + id + '.json',
          success: function (data) {
            Metamaps.Topics.add(data)
            callback(Metamaps.Topics.get(id))
          }
        })
      }
    } else {
      if (!callback) {
        return Metamaps.Topics.get(id)
      } else {
        return callback(Metamaps.Topics.get(id))
      }
    }
  },
  launch: function (id) {
    var bb = Metamaps.Backbone
    var start = function (data) {
      Metamaps.Active.Topic = new bb.Topic(data.topic)
      Metamaps.Creators = new bb.MapperCollection(data.creators)
      Metamaps.Topics = new bb.TopicCollection([data.topic].concat(data.relatives))
      Metamaps.Synapses = new bb.SynapseCollection(data.synapses)
      Metamaps.Backbone.attachCollectionEvents()

      // set filter mapper H3 text
      $('#filter_by_mapper h3').html('CREATORS')

      // build and render the visualization
      Metamaps.Visualize.type = 'RGraph'
      Metamaps.JIT.prepareVizData()

      // update filters
      Metamaps.Filter.reset()

      // reset selected arrays
      Metamaps.Selected.reset()

      // these three update the actual filter box with the right list items
      Metamaps.Filter.checkMetacodes()
      Metamaps.Filter.checkSynapses()
      Metamaps.Filter.checkMappers()
    }

    $.ajax({
      url: '/topics/' + id + '/network.json',
      success: start
    })
  },
  end: function () {
    if (Metamaps.Active.Topic) {
      $('.rightclickmenu').remove()
      Metamaps.TopicCard.hideCard()
      Metamaps.SynapseCard.hideCard()
      Metamaps.Filter.close()
    }
  },
  centerOn: function (nodeid) {
    if (!Metamaps.Visualize.mGraph.busy) {
      Metamaps.Visualize.mGraph.onClick(nodeid, {
        hideLabels: false,
        duration: 1000,
        onComplete: function () {}
      })
    }
  },
  fetchRelatives: function (node, metacode_id) {
    var topics = Metamaps.Topics.map(function (t) { return t.id })
    var topics_string = topics.join()

    var creators = Metamaps.Creators.map(function (t) { return t.id })
    var creators_string = creators.join()

    var topic = node.getData('topic')

    var successCallback = function (data) {
      if (data.creators.length > 0) Metamaps.Creators.add(data.creators)
      if (data.topics.length > 0) Metamaps.Topics.add(data.topics)
      if (data.synapses.length > 0) Metamaps.Synapses.add(data.synapses)

      var topicColl = new Metamaps.Backbone.TopicCollection(data.topics)
      topicColl.add(topic)
      var synapseColl = new Metamaps.Backbone.SynapseCollection(data.synapses)

      var graph = Metamaps.JIT.convertModelsToJIT(topicColl, synapseColl)[0]
      Metamaps.Visualize.mGraph.op.sum(graph, {
        type: 'fade',
        duration: 500,
        hideLabels: false
      })

      var i, l, t, s

      Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
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
    }

    var paramsString = metacode_id ? 'metacode=' + metacode_id + '&' : ''
    paramsString += 'network=' + topics_string + '&creators=' + creators_string

    $.ajax({
      type: 'Get',
      url: '/topics/' + topic.id + '/relatives.json?' + paramsString,
      success: successCallback,
      error: function () {}
    })
  },
  /*
   *
   *
   */
  renderTopic: function (mapping, topic, createNewInDB, permitCreateSynapseAfter) {
    var self = Metamaps.Topic

    var nodeOnViz, tempPos

    var newnode = topic.createNode()

    var midpoint = {}, pixelPos

    if (!$.isEmptyObject(Metamaps.Visualize.mGraph.graph.nodes)) {
      Metamaps.Visualize.mGraph.graph.addNode(newnode)
      nodeOnViz = Metamaps.Visualize.mGraph.graph.getNode(newnode.id)
      topic.set('node', nodeOnViz, {silent: true})
      topic.updateNode() // links the topic and the mapping to the node

      nodeOnViz.setData('dim', 1, 'start')
      nodeOnViz.setData('dim', 25, 'end')
      if (Metamaps.Visualize.type === 'RGraph') {
        tempPos = new $jit.Complex(mapping.get('xloc'), mapping.get('yloc'))
        tempPos = tempPos.toPolar()
        nodeOnViz.setPos(tempPos, 'current')
        nodeOnViz.setPos(tempPos, 'start')
        nodeOnViz.setPos(tempPos, 'end')
      } else if (Metamaps.Visualize.type === 'ForceDirected') {
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'current')
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'start')
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'end')
      }
      if (Metamaps.Create.newTopic.addSynapse && permitCreateSynapseAfter) {
        Metamaps.Create.newSynapse.topic1id = Metamaps.tempNode.getData('topic').id

        // position the form
        midpoint.x = Metamaps.tempNode.pos.getc().x + (nodeOnViz.pos.getc().x - Metamaps.tempNode.pos.getc().x) / 2
        midpoint.y = Metamaps.tempNode.pos.getc().y + (nodeOnViz.pos.getc().y - Metamaps.tempNode.pos.getc().y) / 2
        pixelPos = Metamaps.Util.coordsToPixels(midpoint)
        $('#new_synapse').css('left', pixelPos.x + 'px')
        $('#new_synapse').css('top', pixelPos.y + 'px')
        // show the form
        Metamaps.Create.newSynapse.open()
        Metamaps.Visualize.mGraph.fx.animate({
          modes: ['node-property:dim'],
          duration: 500,
          onComplete: function () {
            Metamaps.tempNode = null
            Metamaps.tempNode2 = null
            Metamaps.tempInit = false
          }
        })
      } else {
        Metamaps.Visualize.mGraph.fx.plotNode(nodeOnViz, Metamaps.Visualize.mGraph.canvas)
        Metamaps.Visualize.mGraph.fx.animate({
          modes: ['node-property:dim'],
          duration: 500,
          onComplete: function () {}
        })
      }
    } else {
      Metamaps.Visualize.mGraph.loadJSON(newnode)
      nodeOnViz = Metamaps.Visualize.mGraph.graph.getNode(newnode.id)
      topic.set('node', nodeOnViz, {silent: true})
      topic.updateNode() // links the topic and the mapping to the node

      nodeOnViz.setData('dim', 1, 'start')
      nodeOnViz.setData('dim', 25, 'end')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'current')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'start')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'end')
      Metamaps.Visualize.mGraph.fx.plotNode(nodeOnViz, Metamaps.Visualize.mGraph.canvas)
      Metamaps.Visualize.mGraph.fx.animate({
        modes: ['node-property:dim'],
        duration: 500,
        onComplete: function () {}
      })
    }

    var mappingSuccessCallback = function (mappingModel, response) {
      var newTopicData = {
        mappingid: mappingModel.id,
        mappableid: mappingModel.get('mappable_id')
      }

      $(document).trigger(Metamaps.JIT.events.newTopic, [newTopicData])
    }
    var topicSuccessCallback = function (topicModel, response) {
      if (Metamaps.Active.Map) {
        mapping.save({ mappable_id: topicModel.id }, {
          success: mappingSuccessCallback,
          error: function (model, response) {
            console.log('error saving mapping to database')
          }
        })
      }

      if (Metamaps.Create.newTopic.addSynapse) {
        Metamaps.Create.newSynapse.topic2id = topicModel.id
      }
    }

    if (!Metamaps.Settings.sandbox && createNewInDB) {
      if (topic.isNew()) {
        topic.save(null, {
          success: topicSuccessCallback,
          error: function (model, response) {
            console.log('error saving topic to database')
          }
        })
      } else if (!topic.isNew() && Metamaps.Active.Map) {
        mapping.save(null, {
          success: mappingSuccessCallback
        })
      }
    }
  },
  createTopicLocally: function () {
    var self = Metamaps.Topic

    if (Metamaps.Create.newTopic.name === '') {
      Metamaps.GlobalUI.notifyUser('Please enter a topic title...')
      return
    }

    // hide the 'double-click to add a topic' message
    Metamaps.Famous.viz.hideInstructions()

    $(document).trigger(Metamaps.Map.events.editedByActiveMapper)

    var metacode = Metamaps.Metacodes.get(Metamaps.Create.newTopic.metacode)

    var topic = new Metamaps.Backbone.Topic({
      name: Metamaps.Create.newTopic.name,
      metacode_id: metacode.id,
      defer_to_map_id: Metamaps.Active.Map.id
    })
    Metamaps.Topics.add(topic)

    var mapping = new Metamaps.Backbone.Mapping({
      xloc: Metamaps.Create.newTopic.x,
      yloc: Metamaps.Create.newTopic.y,
      mappable_id: topic.cid,
      mappable_type: 'Topic',
    })
    Metamaps.Mappings.add(mapping)

    // these can't happen until the value is retrieved, which happens in the line above
    Metamaps.Create.newTopic.hide()

    self.renderTopic(mapping, topic, true, true) // this function also includes the creation of the topic in the database
  },
  getTopicFromAutocomplete: function (id) {
    var self = Metamaps.Topic

    $(document).trigger(Metamaps.Map.events.editedByActiveMapper)

    Metamaps.Create.newTopic.hide()

    var topic = self.get(id)

    var mapping = new Metamaps.Backbone.Mapping({
      xloc: Metamaps.Create.newTopic.x,
      yloc: Metamaps.Create.newTopic.y,
      mappable_type: 'Topic',
      mappable_id: topic.id,
    })
    Metamaps.Mappings.add(mapping)

    self.renderTopic(mapping, topic, true, true)
  },
  getTopicFromSearch: function (event, id) {
    var self = Metamaps.Topic

    $(document).trigger(Metamaps.Map.events.editedByActiveMapper)

    var topic = self.get(id)

    var nextCoords = Metamaps.Map.getNextCoord()
    var mapping = new Metamaps.Backbone.Mapping({
      xloc: nextCoords.x,
      yloc: nextCoords.y,
      mappable_type: 'Topic',
      mappable_id: topic.id,
    })
    Metamaps.Mappings.add(mapping)

    self.renderTopic(mapping, topic, true, true)

    Metamaps.GlobalUI.notifyUser('Topic was added to your map!')

    event.stopPropagation()
    event.preventDefault()
    return false
  }
}; // end Metamaps.Topic

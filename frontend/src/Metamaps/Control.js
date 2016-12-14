/* global $ */

import _ from 'lodash'
import outdent from 'outdent'

import Active from './Active'
import DataModel from './DataModel'
import Filter from './Filter'
import GlobalUI from './GlobalUI'
import JIT from './JIT'
import Mouse from './Mouse'
import Selected from './Selected'
import Settings from './Settings'
import Visualize from './Visualize'

const Control = {
  init: function() {},
  selectNode: function(node, e) {
    var filtered = node.getData('alpha') === 0

    if (filtered || Selected.Nodes.indexOf(node) !== -1) return
    node.selected = true
    node.setData('dim', 30, 'current')
    Selected.Nodes.push(node)
  },
  deselectAllNodes: function() {
    var l = Selected.Nodes.length
    for (var i = l - 1; i >= 0; i -= 1) {
      var node = Selected.Nodes[i]
      Control.deselectNode(node)
    }
    Visualize.mGraph.plot()
  },
  deselectNode: function(node) {
    delete node.selected
    node.setData('dim', 25, 'current')

    // remove the node
    Selected.Nodes.splice(
      Selected.Nodes.indexOf(node), 1)
  },
  removeSelected: function() {
    Control.removeSelectedEdges()
    Control.removeSelectedNodes()
  },
  hideSelected: function() {
    Control.hideSelectedEdges()
    Control.hideSelectedNodes()
  },
  removeSelectedNodes: function() { // refers to removing topics permanently from a map
    if (Active.Topic) {
      // hideNode will handle synapses as well
      var nodeids = _.map(Selected.Nodes, function(node) {
        return node.id
      })
      _.each(nodeids, function(nodeid) {
        if (Active.Topic.id !== nodeid) {
          DataModel.Topics.remove(nodeid)
          Control.hideNode(nodeid)
        }
      })
      return
    }
    if (!Active.Map) return

    const l = Selected.Nodes.length
    const authorized = Active.Map.authorizeToEdit(Active.Mapper)

    if (!authorized) {
      GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    for (let i = l - 1; i >= 0; i -= 1) {
      const node = Selected.Nodes[i]
      Control.removeNode(node.id)
    }
  },
  removeNode: function(nodeid) { // refers to removing topics permanently from a map
    if (!Active.Map) return

    var authorized = Active.Map.authorizeToEdit(Active.Mapper)
    var node = Visualize.mGraph.graph.getNode(nodeid)

    if (!authorized) {
      GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    var topic = node.getData('topic')
    var mappableid = topic.id
    var mapping = node.getData('mapping')
    mapping.destroy()
    DataModel.Topics.remove(topic)
    $(document).trigger(JIT.events.removeTopic, [{
      mappableid: mappableid
    }])
    Control.hideNode(nodeid)
  },
  hideSelectedNodes: function() {
    const l = Selected.Nodes.length
    for (let i = l - 1; i >= 0; i -= 1) {
      const node = Selected.Nodes[i]
      Control.hideNode(node.id)
    }
  },
  hideNode: function(nodeid) {
    var node = Visualize.mGraph.graph.getNode(nodeid)
    var graph = Visualize.mGraph

    Control.deselectNode(node)

    node.setData('alpha', 0, 'end')
    node.eachAdjacency(function(adj) {
      adj.setData('alpha', 0, 'end')
    })
    Visualize.mGraph.fx.animate({
      modes: ['node-property:alpha',
        'edge-property:alpha'
      ],
      duration: 500
    })
    setTimeout(function() {
      if (nodeid === Visualize.mGraph.root) { // && Visualize.type === "RGraph"
        var newroot = _.find(graph.graph.nodes, function(n) { return n.id !== nodeid })
        graph.root = newroot ? newroot.id : null
      }
      Visualize.mGraph.graph.removeNode(nodeid)
    }, 500)
    Filter.checkMetacodes()
    Filter.checkMappers()
  },
  selectEdge: function(edge) {
    var filtered = edge.getData('alpha') === 0 // don't select if the edge is filtered

    if (filtered || Selected.Edges.indexOf(edge) !== -1) return

    var width = Mouse.edgeHoveringOver === edge ? 4 : 2
    edge.setDataset('current', {
      showDesc: true,
      lineWidth: width,
      color: Settings.colors.synapses.selected
    })
    Visualize.mGraph.plot()

    Selected.Edges.push(edge)
  },
  deselectAllEdges: function() {
    var l = Selected.Edges.length
    for (var i = l - 1; i >= 0; i -= 1) {
      var edge = Selected.Edges[i]
      Control.deselectEdge(edge)
    }
    Visualize.mGraph.plot()
  },
  deselectEdge: function(edge) {
    edge.setData('showDesc', false, 'current')

    edge.setDataset('current', {
      lineWidth: 2,
      color: Settings.colors.synapses.normal
    })

    if (Mouse.edgeHoveringOver === edge) {
      edge.setDataset('current', {
        showDesc: true,
        lineWidth: 4
      })
    }

    Visualize.mGraph.plot()

    // remove the edge
    Selected.Edges.splice(
      Selected.Edges.indexOf(edge), 1)
  },
  removeSelectedEdges: function() {
    // Topic view is handled by removeSelectedNodes
    if (!Active.Map) return

    const l = Selected.Edges.length

    var authorized = Active.Map.authorizeToEdit(Active.Mapper)

    if (!authorized) {
      GlobalUI.notifyUser('Cannot edit this map.')
      return
    }

    for (let i = l - 1; i >= 0; i -= 1) {
      const edge = Selected.Edges[i]
      Control.removeEdge(edge)
    }
    Selected.Edges = [ ]
  },
  removeEdge: function(edge) {
    if (!Active.Map) return

    var authorized = Active.Map.authorizeToEdit(Active.Mapper)

    if (!authorized) {
      GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    if (edge.getData('mappings').length - 1 === 0) {
      Control.hideEdge(edge)
    }

    var index = edge.getData('displayIndex') ? edge.getData('displayIndex') : 0

    var synapse = edge.getData('synapses')[index]
    var mapping = edge.getData('mappings')[index]
    var mappableid = synapse.id
    mapping.destroy()

    DataModel.Synapses.remove(synapse)

    edge.getData('mappings').splice(index, 1)
    edge.getData('synapses').splice(index, 1)
    if (edge.getData('displayIndex')) {
      delete edge.data.$displayIndex
    }
    $(document).trigger(JIT.events.removeSynapse, [{
      mappableid: mappableid
    }])
  },
  hideSelectedEdges: function() {
    const l = Selected.Edges.length
    for (let i = l - 1; i >= 0; i -= 1) {
      const edge = Selected.Edges[i]
      Control.hideEdge(edge)
    }
    Selected.Edges = [ ]
  },
  hideEdge: function(edge) {
    var from = edge.nodeFrom.id
    var to = edge.nodeTo.id
    edge.setData('alpha', 0, 'end')
    Control.deselectEdge(edge)
    Visualize.mGraph.fx.animate({
      modes: ['edge-property:alpha'],
      duration: 500
    })
    setTimeout(function() {
      Visualize.mGraph.graph.removeAdjacence(from, to)
    }, 500)
    Filter.checkSynapses()
    Filter.checkMappers()
  },
  updateSelectedPermissions: function(permission) {
    var edge, synapse, node, topic

    GlobalUI.notifyUser('Working...')

    // variables to keep track of how many nodes and synapses you had the ability to change the permission of
    var nCount = 0
    var sCount = 0

    // change the permission of the selected synapses, if logged in user is the original creator
    const edgesLength = Selected.Edges.length
    for (let i = edgesLength - 1; i >= 0; i -= 1) {
      edge = Selected.Edges[i]
      synapse = edge.getData('synapses')[0]

      if (synapse.authorizePermissionChange(Active.Mapper)) {
        synapse.save({
          permission: permission
        })
        sCount++
      }
    }

    // change the permission of the selected topics, if logged in user is the original creator
    const nodesLength = Selected.Nodes.length
    for (let i = nodesLength - 1; i >= 0; i -= 1) {
      node = Selected.Nodes[i]
      topic = node.getData('topic')

      if (topic.authorizePermissionChange(Active.Mapper)) {
        topic.save({
          permission: permission
        })
        nCount++
      }
    }

    var nString = nCount === 1 ? (nCount.toString() + ' topic and ') : (nCount.toString() + ' topics and ')
    var sString = sCount === 1 ? (sCount.toString() + ' synapse') : (sCount.toString() + ' synapses')

    var message = nString + sString + ' you created updated to ' + permission
    GlobalUI.notifyUser(message)
  },
  updateSelectedMetacodes: function(metacodeId) {
    var node, topic

    GlobalUI.notifyUser('Working...')

    var metacode = DataModel.Metacodes.get(metacodeId)

    // variables to keep track of how many nodes and synapses you had the ability to change the permission of
    var nCount = 0

    // change the permission of the selected topics, if logged in user is the original creator
    var l = Selected.Nodes.length
    for (var i = l - 1; i >= 0; i -= 1) {
      node = Selected.Nodes[i]
      topic = node.getData('topic')

      if (topic.authorizeToEdit(Active.Mapper)) {
        topic.save({
          'metacode_id': metacodeId
        })
        nCount++
      }
    }

    var nString = nCount === 1 ? (nCount.toString() + ' topic') : (nCount.toString() + ' topics')

    var message = nString + ' you can edit updated to ' + metacode.get('name')
    GlobalUI.notifyUser(message)
    Visualize.mGraph.plot()
  }
}

export default Control

/* global Metamaps, $ */

/*
 * Metamaps.Control.js.erb
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.Control
 *  - Metamaps.Filter
 *  - Metamaps.GlobalUI
 *  - Metamaps.JIT
 *  - Metamaps.Mappings
 *  - Metamaps.Metacodes
 *  - Metamaps.Mouse
 *  - Metamaps.Selected
 *  - Metamaps.Settings
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 *  - Metamaps.Visualize
 */

Metamaps.Control = {
  init: function () {},
  selectNode: function (node, e) {
    var filtered = node.getData('alpha') === 0

    if (filtered || Metamaps.Selected.Nodes.indexOf(node) != -1) return
    node.selected = true
    node.setData('dim', 30, 'current')
    Metamaps.Selected.Nodes.push(node)
  },
  deselectAllNodes: function () {
    var l = Metamaps.Selected.Nodes.length
    for (var i = l - 1; i >= 0; i -= 1) {
      var node = Metamaps.Selected.Nodes[i]
      Metamaps.Control.deselectNode(node)
    }
    Metamaps.Visualize.mGraph.plot()
  },
  deselectNode: function (node) {
    delete node.selected
    node.setData('dim', 25, 'current')

    // remove the node
    Metamaps.Selected.Nodes.splice(
      Metamaps.Selected.Nodes.indexOf(node), 1)
  },
  deleteSelected: function () {
    if (!Metamaps.Active.Map) return

    var n = Metamaps.Selected.Nodes.length
    var e = Metamaps.Selected.Edges.length
    var ntext = n == 1 ? '1 topic' : n + ' topics'
    var etext = e == 1 ? '1 synapse' : e + ' synapses'
    var text = 'You have ' + ntext + ' and ' + etext + ' selected. '

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    var r = confirm(text + 'Are you sure you want to permanently delete them all? This will remove them from all maps they appear on.')
    if (r == true) {
      Metamaps.Control.deleteSelectedEdges()
      Metamaps.Control.deleteSelectedNodes()
    }
  },
  deleteSelectedNodes: function () { // refers to deleting topics permanently
    if (!Metamaps.Active.Map) return

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    var l = Metamaps.Selected.Nodes.length
    for (var i = l - 1; i >= 0; i -= 1) {
      var node = Metamaps.Selected.Nodes[i]
      Metamaps.Control.deleteNode(node.id)
    }
  },
  deleteNode: function (nodeid) { // refers to deleting topics permanently
    if (!Metamaps.Active.Map) return

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid)
    var topic = node.getData('topic')

    var permToDelete = Metamaps.Active.Mapper.id === topic.get('user_id') || Metamaps.Active.Mapper.get('admin')
    if (permToDelete) {
      var mappableid = topic.id
      var mapping = node.getData('mapping')
      topic.destroy()
      Metamaps.Mappings.remove(mapping)
      $(document).trigger(Metamaps.JIT.events.deleteTopic, [{
        mappableid: mappableid
      }])
      Metamaps.Control.hideNode(nodeid)
    } else {
      Metamaps.GlobalUI.notifyUser('Only topics you created can be deleted')
    }
  },
  removeSelectedNodes: function () { // refers to removing topics permanently from a map
    if (Metamaps.Active.Topic) {
      // hideNode will handle synapses as well
      var nodeids = _.map(Metamaps.Selected.Nodes, function(node) {
        return node.id
      })
      _.each(nodeids, function(nodeid) {
        if (Metamaps.Active.Topic.id !== nodeid) {
          Metamaps.Topics.remove(nodeid)
          Metamaps.Control.hideNode(nodeid)
        }
      })
      return
    }
    if (!Metamaps.Active.Map) return

    var l = Metamaps.Selected.Nodes.length,
      i,
      node,
      authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    for (i = l - 1; i >= 0; i -= 1) {
      node = Metamaps.Selected.Nodes[i]
      Metamaps.Control.removeNode(node.id)
    }
  },
  removeNode: function (nodeid) { // refers to removing topics permanently from a map
    if (!Metamaps.Active.Map) return

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)
    var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    var topic = node.getData('topic')
    var mappableid = topic.id
    var mapping = node.getData('mapping')
    mapping.destroy()
    Metamaps.Topics.remove(topic)
    $(document).trigger(Metamaps.JIT.events.removeTopic, [{
      mappableid: mappableid
    }])
    Metamaps.Control.hideNode(nodeid)
  },
  hideSelectedNodes: function () {
    var l = Metamaps.Selected.Nodes.length,
      i,
      node

    for (i = l - 1; i >= 0; i -= 1) {
      node = Metamaps.Selected.Nodes[i]
      Metamaps.Control.hideNode(node.id)
    }
  },
  hideNode: function (nodeid) {
    var node = Metamaps.Visualize.mGraph.graph.getNode(nodeid)
    var graph = Metamaps.Visualize.mGraph

    Metamaps.Control.deselectNode(node)

    node.setData('alpha', 0, 'end')
    node.eachAdjacency(function (adj) {
      adj.setData('alpha', 0, 'end')
    })
    Metamaps.Visualize.mGraph.fx.animate({
      modes: ['node-property:alpha',
        'edge-property:alpha'
      ],
      duration: 500
    })
    setTimeout(function () {
      if (nodeid == Metamaps.Visualize.mGraph.root) { // && Metamaps.Visualize.type === "RGraph"
        var newroot = _.find(graph.graph.nodes, function (n) { return n.id !== nodeid; })
        graph.root = newroot ? newroot.id : null
      }
      Metamaps.Visualize.mGraph.graph.removeNode(nodeid)
    }, 500)
    Metamaps.Filter.checkMetacodes()
    Metamaps.Filter.checkMappers()
  },
  selectEdge: function (edge) {
    var filtered = edge.getData('alpha') === 0; // don't select if the edge is filtered

    if (filtered || Metamaps.Selected.Edges.indexOf(edge) != -1) return

    var width = Metamaps.Mouse.edgeHoveringOver === edge ? 4 : 2
    edge.setDataset('current', {
      showDesc: true,
      lineWidth: width,
      color: Metamaps.Settings.colors.synapses.selected
    })
    Metamaps.Visualize.mGraph.plot()

    Metamaps.Selected.Edges.push(edge)
  },
  deselectAllEdges: function () {
    var l = Metamaps.Selected.Edges.length
    for (var i = l - 1; i >= 0; i -= 1) {
      var edge = Metamaps.Selected.Edges[i]
      Metamaps.Control.deselectEdge(edge)
    }
    Metamaps.Visualize.mGraph.plot()
  },
  deselectEdge: function (edge) {
    edge.setData('showDesc', false, 'current')

    edge.setDataset('current', {
      lineWidth: 2,
      color: Metamaps.Settings.colors.synapses.normal
    })

    if (Metamaps.Mouse.edgeHoveringOver == edge) {
      edge.setDataset('current', {
        showDesc: true,
        lineWidth: 4
      })
    }

    Metamaps.Visualize.mGraph.plot()

    // remove the edge
    Metamaps.Selected.Edges.splice(
      Metamaps.Selected.Edges.indexOf(edge), 1)
  },
  deleteSelectedEdges: function () { // refers to deleting topics permanently
    var edge,
      l = Metamaps.Selected.Edges.length

    if (!Metamaps.Active.Map) return

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    for (var i = l - 1; i >= 0; i -= 1) {
      edge = Metamaps.Selected.Edges[i]
      Metamaps.Control.deleteEdge(edge)
    }
  },
  deleteEdge: function (edge) {
    if (!Metamaps.Active.Map) return

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    var index = edge.getData('displayIndex') ? edge.getData('displayIndex') : 0

    var synapse = edge.getData('synapses')[index]
    var mapping = edge.getData('mappings')[index]

    var permToDelete = Metamaps.Active.Mapper.id === synapse.get('user_id') || Metamaps.Active.Mapper.get('admin')
    if (permToDelete) {
      if (edge.getData('synapses').length - 1 === 0) {
        Metamaps.Control.hideEdge(edge)
      }
      var mappableid = synapse.id
      synapse.destroy()

      // the server will destroy the mapping, we just need to remove it here
      Metamaps.Mappings.remove(mapping)
      edge.getData('mappings').splice(index, 1)
      edge.getData('synapses').splice(index, 1)
      if (edge.getData('displayIndex')) {
        delete edge.data.$displayIndex
      }
      $(document).trigger(Metamaps.JIT.events.deleteSynapse, [{
        mappableid: mappableid
      }])
    } else {
      Metamaps.GlobalUI.notifyUser('Only synapses you created can be deleted')
    }
  },
  removeSelectedEdges: function () {
    // Topic view is handled by removeSelectedNodes
    if (!Metamaps.Active.Map) return

    var l = Metamaps.Selected.Edges.length,
      i,
      edge

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    for (i = l - 1; i >= 0; i -= 1) {
      edge = Metamaps.Selected.Edges[i]
      Metamaps.Control.removeEdge(edge)
    }
    Metamaps.Selected.Edges = [ ]
  },
  removeEdge: function (edge) {
    if (!Metamaps.Active.Map) return

    var authorized = Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
      Metamaps.GlobalUI.notifyUser('Cannot edit Public map.')
      return
    }

    if (edge.getData('mappings').length - 1 === 0) {
      Metamaps.Control.hideEdge(edge)
    }

    var index = edge.getData('displayIndex') ? edge.getData('displayIndex') : 0

    var synapse = edge.getData('synapses')[index]
    var mapping = edge.getData('mappings')[index]
    var mappableid = synapse.id
    mapping.destroy()

    Metamaps.Synapses.remove(synapse)

    edge.getData('mappings').splice(index, 1)
    edge.getData('synapses').splice(index, 1)
    if (edge.getData('displayIndex')) {
      delete edge.data.$displayIndex
    }
    $(document).trigger(Metamaps.JIT.events.removeSynapse, [{
      mappableid: mappableid
    }])
  },
  hideSelectedEdges: function () {
    var edge,
      l = Metamaps.Selected.Edges.length,
      i
    for (i = l - 1; i >= 0; i -= 1) {
      edge = Metamaps.Selected.Edges[i]
      Metamaps.Control.hideEdge(edge)
    }
    Metamaps.Selected.Edges = [ ]
  },
  hideEdge: function (edge) {
    var from = edge.nodeFrom.id
    var to = edge.nodeTo.id
    edge.setData('alpha', 0, 'end')
    Metamaps.Control.deselectEdge(edge)
    Metamaps.Visualize.mGraph.fx.animate({
      modes: ['edge-property:alpha'],
      duration: 500
    })
    setTimeout(function () {
      Metamaps.Visualize.mGraph.graph.removeAdjacence(from, to)
    }, 500)
    Metamaps.Filter.checkSynapses()
    Metamaps.Filter.checkMappers()
  },
  updateSelectedPermissions: function (permission) {
    var edge, synapse, node, topic

    Metamaps.GlobalUI.notifyUser('Working...')

    // variables to keep track of how many nodes and synapses you had the ability to change the permission of
    var nCount = 0,
      sCount = 0

    // change the permission of the selected synapses, if logged in user is the original creator
    var l = Metamaps.Selected.Edges.length
    for (var i = l - 1; i >= 0; i -= 1) {
      edge = Metamaps.Selected.Edges[i]
      synapse = edge.getData('synapses')[0]

      if (synapse.authorizePermissionChange(Metamaps.Active.Mapper)) {
        synapse.save({
          permission: permission
        })
        sCount++
      }
    }

    // change the permission of the selected topics, if logged in user is the original creator
    var l = Metamaps.Selected.Nodes.length
    for (var i = l - 1; i >= 0; i -= 1) {
      node = Metamaps.Selected.Nodes[i]
      topic = node.getData('topic')

      if (topic.authorizePermissionChange(Metamaps.Active.Mapper)) {
        topic.save({
          permission: permission
        })
        nCount++
      }
    }

    var nString = nCount == 1 ? (nCount.toString() + ' topic and ') : (nCount.toString() + ' topics and ')
    var sString = sCount == 1 ? (sCount.toString() + ' synapse') : (sCount.toString() + ' synapses')

    var message = nString + sString + ' you created updated to ' + permission
    Metamaps.GlobalUI.notifyUser(message)
  },
  updateSelectedMetacodes: function (metacode_id) {
    var node, topic

    Metamaps.GlobalUI.notifyUser('Working...')

    var metacode = Metamaps.Metacodes.get(metacode_id)

    // variables to keep track of how many nodes and synapses you had the ability to change the permission of
    var nCount = 0

    // change the permission of the selected topics, if logged in user is the original creator
    var l = Metamaps.Selected.Nodes.length
    for (var i = l - 1; i >= 0; i -= 1) {
      node = Metamaps.Selected.Nodes[i]
      topic = node.getData('topic')

      if (topic.authorizeToEdit(Metamaps.Active.Mapper)) {
        topic.save({
          'metacode_id': metacode_id
        })
        nCount++
      }
    }

    var nString = nCount == 1 ? (nCount.toString() + ' topic') : (nCount.toString() + ' topics')

    var message = nString + ' you can edit updated to ' + metacode.get('name')
    Metamaps.GlobalUI.notifyUser(message)
    Metamaps.Visualize.mGraph.plot()
  },
}; // end Metamaps.Control

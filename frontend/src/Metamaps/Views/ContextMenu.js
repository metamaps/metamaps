import Control from '../Control'
import DataModel from '../DataModel'
import { ReactApp } from '../GlobalUI'
import Selected from '../Selected'
import Topic from '../Topic'

const ContextMenu = {
  clickedNode: null,
  clickedEdge: null,
  pos: {x: 0, y: 0},
  fetchingSiblingsData: false,
  siblingsData: null,
  selectNode: (node, pos) => {
    ContextMenu.pos = pos
    ContextMenu.clickedNode = node
    ContextMenu.clickedEdge = null
    ContextMenu.fetchingSiblingsData = false
    ContextMenu.siblingsData = null
    ReactApp.render()
  },
  selectEdge: (edge, pos) => {
    ContextMenu.pos = pos
    ContextMenu.clickedNode = null
    ContextMenu.clickedEdge = edge
    ContextMenu.fetchingSiblingsData = false
    ContextMenu.siblingsData = null
    ReactApp.render()
  },
  reset: () => {
    ContextMenu.fetchingSiblingsData = false
    ContextMenu.siblingsData = null
    ContextMenu.clickedNode = null
    ContextMenu.clickedEdge = null
    ReactApp.render()
  },
  delete: () => {
    Control.deleteSelected()
    ContextMenu.reset()
  },
  remove: () => {
    Control.removeSelectedEdges()
    Control.removeSelectedNodes()
    ContextMenu.reset()
  },
  hide: () => {
    Control.hideSelectedEdges()
    Control.hideSelectedNodes()
    ContextMenu.reset()
  },
  centerOn: (id) => {
    Topic.centerOn(id)
    ContextMenu.reset()
  },
  popoutTopic: (id) => {
    ContextMenu.reset()
    const win = window.open('/topics/' + id, '_blank')
    win.focus()
  },
  updatePermissions: (permission) => {
    // will be 'commons' 'public' or 'private'
    Control.updateSelectedPermissions(permission)
    ContextMenu.reset()
  },
  onMetacodeSelect: (id, metacodeId) => {
    if (Selected.Nodes.length > 1) {
      // batch update multiple topics
      Control.updateSelectedMetacodes(metacodeId)
    } else {
      const topic = DataModel.Topics.get(id)
      topic.save({
        metacode_id: metacodeId
      })
    }
    ContextMenu.reset()
  },
  fetchSiblings: (node, metacodeId) => {
    Topic.fetchSiblings(node, metacodeId)
    ContextMenu.reset()
  },
  populateSiblings: function(id) {
    // depending on how many topics are selected, do different things
    ContextMenu.fetchingSiblingsData = true
    ReactApp.render()

    const topics = DataModel.Topics.map(function(t) { return t.id })
    const topicsString = topics.join()

    const successCallback = function(data) {
      ContextMenu.fetchingSiblingsData = false

      // adjust the data for consumption by react
      for (var key in data) {
        data[key] = `${DataModel.Metacodes.get(key).get('name')} (${data[key]})`
      }
      ContextMenu.siblingsData = data
      ReactApp.render()
    }

    $.ajax({
      type: 'GET',
      url: '/topics/' + id + '/relative_numbers.json?network=' + topicsString,
      success: successCallback,
      error: function() {}
    })
  }
}

export default ContextMenu

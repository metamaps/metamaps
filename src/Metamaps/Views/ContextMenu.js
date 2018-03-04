/* global $ */
import Control from '../Control'
import DataModel from '../DataModel'
import Selected from '../Selected'
import Topic from '../Topic'

const ContextMenu = {
  clickedNode: null,
  clickedEdge: null,
  pos: {x: 0, y: 0},
  fetchingSiblingsData: false,
  siblingsData: null,
  selectNode: (render, node, pos) => {
    ContextMenu.pos = pos
    ContextMenu.clickedNode = node
    ContextMenu.clickedEdge = null
    ContextMenu.fetchingSiblingsData = false
    ContextMenu.siblingsData = null
    render()
  },
  selectEdge: (render, edge, pos) => {
    ContextMenu.pos = pos
    ContextMenu.clickedNode = null
    ContextMenu.clickedEdge = edge
    ContextMenu.fetchingSiblingsData = false
    ContextMenu.siblingsData = null
    render()
  },
  reset: (render) => {
    ContextMenu.fetchingSiblingsData = false
    ContextMenu.siblingsData = null
    ContextMenu.clickedNode = null
    ContextMenu.clickedEdge = null
    render()
  },
  delete: (render) => {
    Control.deleteSelected()
    ContextMenu.reset(render)
  },
  remove: (render) => {
    Control.removeSelectedEdges()
    Control.removeSelectedNodes()
    ContextMenu.reset(render)
  },
  hide: (render) => {
    Control.hideSelectedEdges()
    Control.hideSelectedNodes()
    ContextMenu.reset(render)
  },
  centerOn: (render, id) => {
    Topic.centerOn(id)
    ContextMenu.reset(render)
  },
  popoutTopic: (render, id) => {
    ContextMenu.reset(render)
    const win = window.open(`/topics/${id}`, '_blank')
    win.focus()
  },
  updatePermissions: (render, permission) => {
    // will be 'commons' 'public' or 'private'
    Control.updateSelectedPermissions(permission)
    ContextMenu.reset(render)
  },
  onMetacodeSelect: (render, id, metacodeId) => {
    if (Selected.Nodes.length > 1) {
      // batch update multiple topics
      Control.updateSelectedMetacodes(metacodeId)
    } else {
      const topic = DataModel.Topics.get(id)
      topic.save({
        metacode_id: metacodeId
      })
    }
    ContextMenu.reset(render)
  },
  fetchSiblings: (render, node, metacodeId) => {
    Topic.fetchSiblings(node, metacodeId)
    ContextMenu.reset(render)
  },
  populateSiblings: (render, id) => {
    // depending on how many topics are selected, do different things
    ContextMenu.fetchingSiblingsData = true
    render()

    const topics = DataModel.Topics.map(function(t) { return t.id })
    const topicsString = topics.join()

    const successCallback = function(data) {
      ContextMenu.fetchingSiblingsData = false

      // adjust the data for consumption by react
      for (var key in data) {
        data[key] = `${DataModel.Metacodes.get(key).get('name')} (${data[key]})`
      }
      ContextMenu.siblingsData = data
      render()
    }

    $.ajax({
      type: 'GET',
      url: `/topics/${id}/relative_numbers.json?network=${topicsString}`,
      success: successCallback,
      error: function() {}
    })
  }
}

export default ContextMenu

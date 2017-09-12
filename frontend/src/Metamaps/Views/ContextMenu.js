import Control from '../Control'
import DataModel from '../DataModel'
import ReactApp from '../GlobalUI/ReactApp'
import Selected from '../Selected'
import Topic from '../Topic'

const ContextMenu = {
  clickedNode: null,
  clickedEdge: null,
  pos: {x: 0, y: 0},
  siblingsData: null,
  selectNode: (node, pos) => {
    ContextMenu.pos = pos
    ContextMenu.clickedNode = node
    ContextMenu.clickedEdge = null
    ContextMenu.siblingsData = null
    ReactApp.render()
  },
  selectEdge: (edge, pos) => {
    ContextMenu.pos = pos
    ContextMenu.clickedNode = null
    ContextMenu.clickedEdge = edge
    ContextMenu.siblingsData = null
    ReactApp.render()
  },
  reset: () => {
    ContextMenu.siblingsData = null
    ContextMenu.clickedNode = null
    ContextMenu.clickedEdge = null
    ReactApp.render()
  },
  delete: Control.deleteSelected,
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
  fetchRelatives: (node, metacodeId) => {
    Topic.fetchRelatives(node, metacodeId)
    ContextMenu.reset()
  },
  populateSiblings: function(id) {
    // depending on how many topics are selected, do different things

    // add a loading icon for now
    /*const loader = new CanvasLoader('loadingSiblings')
    loader.setColor('#4FC059') // default is '#000000'
    loader.setDiameter(15) // default is 40
    loader.setDensity(41) // default is 40
    loader.setRange(0.9) // default is 1.3
    loader.show() // Hidden by default*/

    const topics = DataModel.Topics.map(function(t) { return t.id })
    const topicsString = topics.join()

    const successCallback = function(data) {
      ContextMenu.siblingsData = data
      ReactApp.render()
      /*$('#loadingSiblings').remove()

      for (var key in data) {
        const string = `${DataModel.Metacodes.get(key).get('name')} (${data[key]})`
        $('#fetchSiblingList').append(`<li class="getSiblings" data-id="${key}">${string}</li>`)
      }

      $('.rc-siblings .getSiblings').click(function() {
        $('.rightclickmenu').remove()
        // data-id is a metacode id
        Topic.fetchRelatives(node, $(this).attr('data-id'))
      })*/
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

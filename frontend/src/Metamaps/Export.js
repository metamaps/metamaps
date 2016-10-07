/* global $ */
import clipboard from 'clipboard-js'

import Active from './Active'
import Control from './Control'
import GlobalUI from './GlobalUI'
import Selected from './Selected'

// simple hack to use the existing ruby export code
// someday we can build a real export function here

const Export = {
  data: null,
  copySelection: function() {
    if (Export.data === null) {
      Export.loadCopyData()
    } else {
      clipboard.copy({
        'text/plain': Export.data,
        'application/json': Export.data
      }).then(() => {
        GlobalUI.notifyUser(`${Selected.Nodes.length} topics and ${Selected.Edges.length} synapses were copied to the clipboard`)
      }, error => {
        GlobalUI.notifyUser(error)
      })
      Export.data = null
    }
  },

  loadCopyData: function() {
    if (!Active.Map) return // someday we can expand this
    const topics = Selected.Nodes.map(node => node.id)

    // deselect synapses not joined to a selected topic
    Selected.Edges.slice(0).forEach(edge => {
      const synapse = edge.getData('synapses')[edge.getData('displayIndex')]
      const topic1_id = synapse.get('topic1_id')
      const topic2_id = synapse.get('topic2_id')
      if (topics.indexOf(topic1_id) === -1 || topics.indexOf(topic2_id) === -1) {
        Control.deselectEdge(edge)
      }
    })

    const synapses = Selected.Edges.map(edge => {
      return edge.getData('synapses')[edge.getData('displayIndex')].id
    })
    
    const url = `/maps/${Active.Map.id}/export.json`
    const query = `topic_ids=${topics.join(',')}&synapse_ids=${synapses.join(',')}`
    $.ajax(`${url}?${query}`, {
      dataType: 'text',
      success: data => {
        Export.data = data
        GlobalUI.notifyUser(`Press Ctrl+C again to copy ${topics.length} topics and ${synapses.length} synapses`)
      }
    })
  }
}

export default Export

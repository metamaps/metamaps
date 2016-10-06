/* global $ */
import Active from './Active'
import GlobalUI from './GlobalUI'
import Selected from './Selected'

const Export = {
  // simple hack to use the existing ruby export code
  // someday we can build a real export function here
  copySelection: function() {
    if (!Active.Map) return // someday we can expand this
    const topic_ids = Selected.Nodes.map(node => node.id).join(',')
    const synapse_ids = Selected.Edges.map(edge => {
      return edge.getData('synapses')[edge.getData('displayIndex')].id
    }).join(',')
    const url = `/maps/${Active.Map.id}/export.json`
    const query = `topic_ids=${topic_ids}&synapse_ids=${synapse_ids}`
    $.ajax(`${url}?${query}`, {
      success: data => {
        $('body').append($('<div id="clipboard-text" style="display: none">" + data + </div>').select())
        const copied = document.execCommand('copy')
        $('#clipboard-text').remove()
        if (copied) {
          GlobalUI.notifyUser(`${Selected.Nodes.length} topics and ${Selected.Edges.length} synapses were copied to the clipboard`)
        } else {
          GlobalUI.notifyUser(`Copy-paste failed, try manually exporting the map at ${url}.`)
        }
      }
    })
  }
}

export default Export

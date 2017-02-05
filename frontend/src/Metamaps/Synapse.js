/* global $ */

import Active from './Active'
import Control from './Control'
import Create from './Create'
import DataModel from './DataModel'
import Engine from './Engine'
import JIT from './JIT'
import Map from './Map'
import Selected from './Selected'
import Settings from './Settings'
import Visualize from './Visualize'

const noOp = () => {}

const Synapse = {
  // this function is to retrieve a synapse JSON object from the database
  // @param id = the id of the synapse to retrieve
  get: function(id, callback = noOp) {
    // if the desired topic is not yet in the local topic repository, fetch it
    if (DataModel.Synapses.get(id) === undefined) {
      $.ajax({
        url: '/synapses/' + id + '.json',
        success: function(data) {
          DataModel.Synapses.add(data)
          callback(DataModel.Synapses.get(id))
        }
      })
    } else callback(DataModel.Synapses.get(id))
  },

  renderSynapse: function(mapping, synapse, node1, node2, fromRemote) {
    const newedge = synapse.createEdge(mapping)
    Visualize.mGraph.graph.addAdjacence(node1, node2, newedge.data)
    const edgeOnViz = Visualize.mGraph.graph.getAdjacence(node1.id, node2.id)
    synapse.set('edge', edgeOnViz)
    synapse.updateEdge() // links the synapse and the mapping to the edge
    if (!fromRemote && synapse.isNew()) {
      synapse.save(null, {
        success: synapseModel => Active.Map && mapping.save({ mappable_id: synapseModel.id })
      })
    } else if (!fromRemote && !synapse.isNew() && Active.Map) {
      mapping.save()
    }
  },
  createSynapseLocally: function(topic1id, topic2id) {
    var self = Synapse
    $(document).trigger(Map.events.editedByActiveMapper)
    // for each node in this array we will create a synapse going to the position2 node.
    const synapsesToCreate = []
    const topic2 = DataModel.Topics.get(topic2id)
    const node2 = topic2.get('node')
    if (Selected.Nodes.length === 0) {
      synapsesToCreate.push(DataModel.Topics.get(topic1id).get('node'))
    } else {
      synapsesToCreate.concat(Selected.Nodes)
    }
    synapsesToCreate.forEach(node1 => {
      const topic1 = node1.getData('topic')
      const synapse = new DataModel.Synapse({
        desc: Create.newSynapse.description || '',
        topic1_id: topic1.id,
        topic2_id: topic2.id
      })
      DataModel.Synapses.add(synapse)
      const mapping = new DataModel.Mapping({
        mappable_type: 'Synapse',
        mappable_id: synapse.cid
      })
      DataModel.Mappings.add(mapping)
      // this function also includes the creation of the synapse in the database
      self.renderSynapse(mapping, synapse, node1, node2)
    }) // for each in synapsesToCreate
  },
  getSynapseFromAutocomplete: function(id) {
    var self = Synapse

    self.get(id, synapse => {
      const mapping = new DataModel.Mapping({
        mappable_type: 'Synapse',
        mappable_id: synapse.id
      })
      DataModel.Mappings.add(mapping)
      const topic1 = DataModel.Topics.get(Create.newSynapse.topic1id)
      const node1 = topic1.get('node')
      const topic2 = DataModel.Topics.get(Create.newSynapse.topic2id)
      const node2 = topic2.get('node')
      Create.newSynapse.hide()
      self.renderSynapse(mapping, synapse, node1, node2)
      Engine.runLayout()
    })
  }
}

export default Synapse

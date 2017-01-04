/* global $ */

import _ from 'lodash'
import outdent from 'outdent'
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Active from '../Active'
import Filter from '../Filter'
import JIT from '../JIT'
import Realtime from '../Realtime'
import SynapseCard from '../SynapseCard'
import Visualize from '../Visualize'

import DataModel from './index'

const Synapse = Backbone.Model.extend({
  urlRoot: '/synapses',
  blacklist: ['edge', 'created_at', 'updated_at'],
  toJSON: function(options) {
    return _.omit(this.attributes, this.blacklist)
  },
  initialize: function() {
    if (this.isNew()) {
      this.set({
        'user_id': Active.Mapper.id,
        'permission': Active.Map ? Active.Map.get('permission') : 'commons',
        'category': 'from-to'
      })
    }
    this.on('changeByOther', this.updateCardView)
    this.on('change', this.updateEdgeView)
    this.on('change:desc', Filter.checkSynapses, this)
  },
  prepareLiForFilter: function() {
    return outdent`
      <li data-id="${this.get('desc')}">
        <img src="${DataModel.synapseIconUrl}" alt="synapse icon" />
        <p>${this.get('desc')}</p>
      </li>`
  },
  authorizeToEdit: function(mapper) {
    if (mapper && (this.get('permission') === 'commons' || this.get('collaborator_ids').includes(mapper.get('id')) || this.get('user_id') === mapper.get('id'))) return true
    else return false
  },
  authorizeToShow: function(mapper) {
    if (this.get('permission') !== 'private' || (mapper && this.get('collaborator_ids').includes(mapper.get('id')) || this.get('user_id') === mapper.get('id'))) return true
    else return false
  },
  authorizePermissionChange: function(mapper) {
    if (mapper && this.get('user_id') === mapper.get('id')) return true
    else return false
  },
  getTopic1: function() {
    return DataModel.Topics.get(this.get('topic1_id'))
  },
  getTopic2: function() {
    return DataModel.Topics.get(this.get('topic2_id'))
  },
  getDirection: function() {
    var t1 = this.getTopic1()
    var t2 = this.getTopic2()

    return t1 && t2 ? [
      t1.get('node').id,
      t2.get('node').id
    ] : false
  },
  getMapping: function() {
    if (!Active.Map) return false

    return DataModel.Mappings.findWhere({
      map_id: Active.Map.id,
      mappable_type: 'Synapse',
      mappable_id: this.isNew() ? this.cid : this.id
    })
  },
  createEdge: function(providedMapping) {
    var mapping, mappingID
    var synapseID = this.isNew() ? this.cid : this.id

    var edge = {
      nodeFrom: this.get('topic1_id'),
      nodeTo: this.get('topic2_id'),
      data: {
        $synapses: [],
        $synapseIDs: [synapseID]
      }
    }

    if (Active.Map) {
      mapping = providedMapping || this.getMapping()
      mappingID = mapping.isNew() ? mapping.cid : mapping.id
      edge.data.$mappings = []
      edge.data.$mappingIDs = [mappingID]
    }

    return edge
  },
  updateEdge: function() {
    var mapping
    var edge = this.get('edge')
    edge.getData('synapses').push(this)

    if (Active.Map) {
      mapping = this.getMapping()
      edge.getData('mappings').push(mapping)
    }

    return edge
  },
  updateViews: function() {
    this.updateCardView()
    this.updateEdgeView()
  },
  updateCardView: function() {
    var onPageWithSynapseCard = Active.Map || Active.Topic
    var edge = this.get('edge')

    // update synapse card, if this synapse is the one open there
    if (onPageWithSynapseCard && edge === SynapseCard.openSynapseCard) {
      SynapseCard.showCard(edge)
    }
  },
  updateEdgeView: function() {
    var onPageWithSynapseCard = Active.Map || Active.Topic
    var edge = this.get('edge')

    // update the edge on the map
    if (onPageWithSynapseCard && edge) {
      Visualize.mGraph.plot()
    }
  }
})

export default Synapse

import Backbone from 'backbone'
Backbone.$ = window.$

import Synapse from './Synapse'

const SynapseCollection = Backbone.Collection.extend({
  model: Synapse,
  url: '/synapses'
})

export default SynapseCollection

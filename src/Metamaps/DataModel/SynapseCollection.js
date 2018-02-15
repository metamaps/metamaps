import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Synapse from './Synapse'

const SynapseCollection = Backbone.Collection.extend({
  model: Synapse,
  url: '/synapses'
})

export default SynapseCollection

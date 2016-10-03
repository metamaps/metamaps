import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Mapping from './Mapping'

const MappingCollection = Backbone.Collection.extend({
  model: Mapping,
  url: '/mappings'
})

export default MappingCollection

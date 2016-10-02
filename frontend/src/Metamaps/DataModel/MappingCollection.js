import Backbone from 'backbone'
Backbone.$ = window.$

import Mapping from './Mapping'

const MappingCollection = Backbone.Collection.extend({
  model: Mapping,
  url: '/mappings'
})

export default MappingCollection

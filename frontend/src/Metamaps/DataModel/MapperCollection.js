import Backbone from 'backbone'
Backbone.$ = window.$

import Mapper from './Mapper'

const MapperCollection = Backbone.Collection.extend({
  model: Mapper,
  url: '/users'
})

export default MapperCollection

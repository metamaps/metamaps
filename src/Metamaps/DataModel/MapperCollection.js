import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Mapper from './Mapper'

const MapperCollection = Backbone.Collection.extend({
  model: Mapper,
  url: '/main/users'
})

export default MapperCollection

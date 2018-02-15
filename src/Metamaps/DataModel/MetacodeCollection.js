import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Metacode from './Metacode'

const MetacodeCollection = Backbone.Collection.extend({
  model: Metacode,
  url: '/metacodes',
  comparator: function(a, b) {
    a = a.get('name').toLowerCase()
    b = b.get('name').toLowerCase()
    return a > b ? 1 : a < b ? -1 : 0
  }
})

export default MetacodeCollection

import _ from 'lodash'
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Active from '../Active'
import Map from '../Map'
import Synapse from '../Synapse'
import Topic from '../Topic'

const Mapping = Backbone.Model.extend({
  urlRoot: '/mappings',
  blacklist: ['created_at', 'updated_at'],
  toJSON: function(options) {
    return _.omit(this.attributes, this.blacklist)
  },
  initialize: function() {
    if (this.isNew()) {
      this.set({
        'user_id': Active.Mapper.id,
        'map_id': Active.Map ? Active.Map.id : null
      })
    }
  },
  getMap: function(callback) {
    Map.get(this.get('map_id'), callback)
  },
  getMappable: function(callback) {
    if (this.get('mappable_type') === 'Topic') {
      Topic.get(this.get('mappable_id'), callback)
    }
    else if (this.get('mappable_type') === 'Synapse') {
      Synapse.get(this.get('mappable_id'), callback)
    }
  }
})

export default Mapping

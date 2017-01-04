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
  getMap: function() {
    return Map.get(this.get('map_id'))
  },
  getTopic: function() {
    if (this.get('mappable_type') !== 'Topic') return false
    return Topic.get(this.get('mappable_id'))
  },
  getSynapse: function() {
    if (this.get('mappable_type') !== 'Synapse') return false
    return Synapse.get(this.get('mappable_id'))
  }
})

export default Mapping

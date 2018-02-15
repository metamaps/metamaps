import _ from 'lodash'
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}
import outdent from 'outdent'

const Mapper = Backbone.Model.extend({
  urlRoot: '/users',
  blacklist: ['created_at', 'updated_at', 'follows'],
  toJSON: function(options) {
    return _.omit(this.attributes, this.blacklist)
  },
  prepareDataForFilter: function() {
    return {
      id: this.id,
      image: this.get('image'),
      name: this.get('name')
    }
  },
  followMap: function(id) {
    const idIndex = this.get('follows').maps.indexOf(id)
    if (idIndex < 0) this.get('follows').maps.push(id)
  },
  unfollowMap: function(id) {
    const idIndex = this.get('follows').maps.indexOf(id)
    if (idIndex > -1) this.get('follows').maps.splice(idIndex, 1)
  },
  followTopic: function(id) {
    const idIndex = this.get('follows').topics.indexOf(id)
    if (idIndex < 0) this.get('follows').topics.push(id)
  },
  unfollowTopic: function(id) {
    const idIndex = this.get('follows').topics.indexOf(id)
    if (idIndex > -1) this.get('follows').topics.splice(idIndex, 1)
  }
})

export default Mapper

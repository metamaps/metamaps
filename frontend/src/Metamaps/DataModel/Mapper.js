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
  prepareLiForFilter: function() {
    return outdent`
      <li data-id="${this.id}">
        <img src="${this.get('image')}" data-id="${this.id}" alt="${this.get('name')}" />
        <p>${this.get('name')}</p>
      </li>`
  },
  followMap: function(id) {
    this.get('follows').maps.push(id)
  },
  unfollowMap: function(id) {
    const idIndex = this.get('follows').maps.indexOf(id)
    if (idIndex > -1) this.get('follows').maps.splice(idIndex, 1)
  },
  followTopic: function(id) {
    this.get('follows').topics.push(id)
  },
  unfollowTopic: function(id) {
    const idIndex = this.get('follows').topics.indexOf(id)
    if (idIndex > -1) this.get('follows').topics.splice(idIndex, 1)
  }
})

export default Mapper

import _ from 'lodash'
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}
import outdent from 'outdent'

const Mapper = Backbone.Model.extend({
  urlRoot: '/users',
  blacklist: ['created_at', 'updated_at'],
  toJSON: function(options) {
    return _.omit(this.attributes, this.blacklist)
  },
  prepareLiForFilter: function() {
    return outdent`
      <li data-id="${this.id}">
        <img src="${this.get('image')}" data-id="${this.id}" alt="${this.get('name')}" />
        <p>${this.get('name')}</p>
      </li>`
  }
})

export default Mapper

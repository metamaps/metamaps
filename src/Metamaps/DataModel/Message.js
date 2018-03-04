import _ from 'lodash'
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

const Message = Backbone.Model.extend({
  urlRoot: '/messages',
  blacklist: ['created_at', 'updated_at'],
  toJSON: function(options) {
    return _.omit(this.attributes, this.blacklist)
  }
})

export default Message

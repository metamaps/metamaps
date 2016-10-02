import _ from 'lodash'
import Backbone from 'backbone'
Backbone.$ = window.$

const Message = Backbone.Model.extend({
  urlRoot: '/messages',
  blacklist: ['created_at', 'updated_at'],
  toJSON: function (options) {
    return _.omit(this.attributes, this.blacklist)
  }
})

export default Message

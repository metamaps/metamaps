import Backbone from 'backbone'
Backbone.$ = window.$

import Message from './Message'

const MessageCollection = Backbone.Collection.extend({
  model: Message,
  url: '/messages'
})

export default MessageCollection

import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Message from './Message'

const MessageCollection = Backbone.Collection.extend({
  model: Message,
  url: '/messages'
})

export default MessageCollection

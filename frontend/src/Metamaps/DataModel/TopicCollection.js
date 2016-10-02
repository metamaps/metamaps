import Backbone from 'backbone'
Backbone.$ = window.$

import Topic from './Topic'

const TopicCollection = Backbone.Collection.extend({
  model: Topic,
  url: '/topics'
})

export default TopicCollection

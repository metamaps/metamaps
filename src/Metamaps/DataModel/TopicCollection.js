import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Topic from './Topic'

const TopicCollection = Backbone.Collection.extend({
  model: Topic,
  url: '/topics'
})

export default TopicCollection

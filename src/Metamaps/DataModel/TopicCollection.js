import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Topic from './Topic'

const TopicCollection = Backbone.Collection.extend({
  model: Topic,
  url: '/main/topics'
})

export default TopicCollection

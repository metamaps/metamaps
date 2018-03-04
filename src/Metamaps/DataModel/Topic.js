import _ from 'lodash'
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Active from '../Active'
import Filter from '../Filter'
import TopicCard from '../Views/TopicCard'
import Visualize from '../Visualize'

import DataModel from './index'

const Topic = Backbone.Model.extend({
  urlRoot: '/topics',
  blacklist: ['node', 'created_at', 'updated_at', 'user_name', 'user_image', 'map_count', 'synapse_count'],
  toJSON: function(options) {
    return _.omit(this.attributes, this.blacklist)
  },
  initialize: function() {
    if (this.isNew()) {
      this.set({
        'user_id': Active.Mapper.id,
        'desc': this.get('desc') || '',
        'link': this.get('link') || '',
        'permission': Active.Map ? Active.Map.get('permission') : 'commons'
      })
    }

    this.on('changeByOther', this.updateCardView)
    this.on('change', this.updateNodeView)
    this.on('change:metacode_id', Filter.checkMetacodes, this)
  },
  authorizeToEdit: function(mapper) {
    if (mapper &&
      (this.get('user_id') === mapper.get('id') ||
      this.get('permission') === 'commons' ||
      this.get('collaborator_ids').includes(mapper.get('id')))) {
      return true
    } else {
      return false
    }
  },
  authorizeToShow: function(mapper) {
    if (this.get('permission') !== 'private' || (mapper && this.get('collaborator_ids').includes(mapper.get('id')) || this.get('user_id') === mapper.get('id'))) return true
    else return false
  },
  authorizePermissionChange: function(mapper) {
    if (mapper && this.get('user_id') === mapper.get('id')) return true
    else return false
  },
  isFollowedBy: function(mapper) {
    return mapper && mapper.get('follows') && mapper.get('follows').topics.indexOf(this.get('id')) > -1
  },
  getDate: function() {},
  getMetacode: function() {
    return DataModel.Metacodes.get(this.get('metacode_id'))
  },
  getMapping: function() {
    if (!Active.Map) return false

    return DataModel.Mappings.findWhere({
      map_id: Active.Map.id,
      mappable_type: 'Topic',
      mappable_id: this.isNew() ? this.cid : this.id
    })
  },
  createNode: function() {
    var mapping
    var node = {
      adjacencies: [],
      id: this.isNew() ? this.cid : this.id,
      name: this.get('name')
    }

    if (Active.Map) {
      mapping = this.getMapping()
      node.data = {
        $mapping: null,
        $mappingID: mapping.id
      }
    }

    return node
  },
  updateNode: function() {
    var mapping
    var node = this.get('node')
    node.setData('topic', this)

    if (Active.Map) {
      mapping = this.getMapping()
      node.setData('mapping', mapping)
    }

    return node
  },
  updateCardView: function() {
    var onPageWithTopicCard = Active.Map || Active.Topic
    var node = this.get('node')
    // update topic card, if this topic is the one open there
    if (onPageWithTopicCard && this === TopicCard.openTopic) {
      TopicCard.showCard(node)
    }
  },
  updateNodeView: function() {
    var onPageWithTopicCard = Active.Map || Active.Topic
    var node = this.get('node')

    if (Active.Mapper.get('follow_topic_on_contributed')) {
      Active.Mapper.followTopic(this.id)
    }

    // update the node on the map
    if (onPageWithTopicCard && node) {
      node.name = this.get('name')
      Visualize.mGraph.plot()
    }
  }
})

export default Topic

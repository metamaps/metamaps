/* global Metamaps, Backbone, $ */

import _ from 'lodash'
import Backbone from 'backbone'
Backbone.$ = window.$

import Active from '../Active'
import Filter from '../Filter'
import JIT from '../JIT'
import Map, { InfoBox } from '../Map'
import Mapper from '../Mapper'
import Realtime from '../Realtime'
import Synapse from '../Synapse'
import SynapseCard from '../SynapseCard'
import Topic from '../Topic'
import TopicCard from '../TopicCard'
import Visualize from '../Visualize'

/*
 * Metamaps.Backbone.js.erb
 *
 * Dependencies:
 *  - Metamaps.Collaborators
 *  - Metamaps.Creators
 *  - Metamaps.Loading
 *  - Metamaps.Mappers
 *  - Metamaps.Mappings
 *  - Metamaps.Metacodes
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 */

const _Backbone = {}

_Backbone.Map = Backbone.Model.extend({
  urlRoot: '/maps',
  blacklist: ['created_at', 'updated_at', 'created_at_clean', 'updated_at_clean', 'user_name', 'contributor_count', 'topic_count', 'synapse_count', 'topics', 'synapses', 'mappings', 'mappers'],
  toJSON: function (options) {
    return _.omit(this.attributes, this.blacklist)
  },
  save: function (key, val, options) {
    var attrs

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (key == null || typeof key === 'object') {
      attrs = key
      options = val
    } else {
      (attrs = {})[key] = val
    }

    var newOptions = options || {}
    var s = newOptions.success

    newOptions.success = function (model, response, opt) {
      if (s) s(model, response, opt)
      model.trigger('saved')
    }
    return Backbone.Model.prototype.save.call(this, attrs, newOptions)
  },
  initialize: function () {
    this.on('changeByOther', this.updateView)
    this.on('saved', this.savedEvent)
  },
  savedEvent: function () {
    Realtime.updateMap(this)
  },
  authorizeToEdit: function (mapper) {
    if (mapper && (
      this.get('permission') === 'commons' ||
      (this.get('collaborator_ids') || []).includes(mapper.get('id')) ||
      this.get('user_id') === mapper.get('id'))) {
      return true
    } else {
      return false
    }
  },
  authorizePermissionChange: function (mapper) {
    if (mapper && this.get('user_id') === mapper.get('id')) {
      return true
    } else {
      return false
    }
  },
  getUser: function () {
    return Mapper.get(this.get('user_id'))
  },
  updateView: function () {
    var map = Active.Map
    var isActiveMap = this.id === map.id
    if (isActiveMap) {
      InfoBox.updateNameDescPerm(this.get('name'), this.get('desc'), this.get('permission'))
      this.updateMapWrapper()
      // mobile menu
      $('#header_content').html(this.get('name'))
      document.title = this.get('name') + ' | Metamaps'
    }
  },
  updateMapWrapper: function () {
    var map = Active.Map
    var isActiveMap = this.id === map.id
    var authorized = map && map.authorizeToEdit(Active.Mapper) ? 'canEditMap' : ''
    var commonsMap = map && map.get('permission') === 'commons' ? 'commonsMap' : ''
    if (isActiveMap) {
      $('.wrapper').removeClass('canEditMap commonsMap').addClass(authorized + ' ' + commonsMap)
    }
  }
})
_Backbone.MapsCollection = Backbone.Collection.extend({
  model: _Backbone.Map,
  initialize: function (models, options) {
    this.id = options.id
    this.sortBy = options.sortBy

    if (options.mapperId) {
      this.mapperId = options.mapperId
    }

    // this.page represents the NEXT page to fetch
    this.page = models.length > 0 ? (models.length < 20 ? 'loadedAll' : 2) : 1
  },
  url: function () {
    if (!this.mapperId) {
      return '/explore/' + this.id + '.json'
    } else {
      return '/explore/mapper/' + this.mapperId + '.json'
    }
  },
  comparator: function (a, b) {
    a = a.get(this.sortBy)
    b = b.get(this.sortBy)
    var temp
    if (this.sortBy === 'name') {
      a = a ? a.toLowerCase() : ''
      b = b ? b.toLowerCase() : ''
    } else {
      // this is for updated_at and created_at
      temp = a
      a = b
      b = temp
      a = (new Date(a)).getTime()
      b = (new Date(b)).getTime()
    }
    return a > b ? 1 : a < b ? -1 : 0
  },
  getMaps: function (cb) {
    var self = this

    Metamaps.Loading.show()

    if (this.page !== 'loadedAll') {
      var numBefore = this.length
      this.fetch({
        remove: false,
        silent: true,
        data: { page: this.page },
        success: function (collection, response, options) {
          // you can pass additional options to the event you trigger here as well
          if (collection.length - numBefore < 20) {
            self.page = 'loadedAll'
          } else {
            self.page += 1
          }
          self.trigger('successOnFetch', cb)
        },
        error: function (collection, response, options) {
          // you can pass additional options to the event you trigger here as well
          self.trigger('errorOnFetch')
        }
      })
    } else {
      self.trigger('successOnFetch', cb)
    }
  }
})

_Backbone.Message = Backbone.Model.extend({
  urlRoot: '/messages',
  blacklist: ['created_at', 'updated_at'],
  toJSON: function (options) {
    return _.omit(this.attributes, this.blacklist)
  },
  prepareLiForFilter: function () {
    /* var li = ''
     * li += '<li data-id="' + this.id.toString() + '">'
     * li += '<img src="' + this.get("image") + '" data-id="' + this.id.toString() + '"'
     * li += ' alt="' + this.get('name') + '" />'
     * li += '<p>' + this.get('name') + '</p></li>'
     * return li
     */
  }
})
_Backbone.MessageCollection = Backbone.Collection.extend({
  model: _Backbone.Message,
  url: '/messages'
})

_Backbone.Mapper = Backbone.Model.extend({
  urlRoot: '/users',
  blacklist: ['created_at', 'updated_at'],
  toJSON: function (options) {
    return _.omit(this.attributes, this.blacklist)
  },
  prepareLiForFilter: function () {
    var li = ''
    li += '<li data-id="' + this.id.toString() + '">'
    li += '<img src="' + this.get('image') + '" data-id="' + this.id.toString() + '"'
    li += ' alt="' + this.get('name') + '" />'
    li += '<p>' + this.get('name') + '</p></li>'
    return li
  }
})

_Backbone.MapperCollection = Backbone.Collection.extend({
  model: _Backbone.Mapper,
  url: '/users'
})

_Backbone.init = function () {
  var self = _Backbone

  self.Metacode = Backbone.Model.extend({
    initialize: function () {
      var image = new Image()
      image.crossOrigin = 'Anonymous'
      image.src = this.get('icon')
      this.set('image', image)
    },
    prepareLiForFilter: function () {
      var li = ''
      li += '<li data-id="' + this.id.toString() + '">'
      li += '<img src="' + this.get('icon') + '" data-id="' + this.id.toString() + '"'
      li += ' alt="' + this.get('name') + '" />'
      li += '<p>' + this.get('name').toLowerCase() + '</p></li>'
      return li
    }

  })
  self.MetacodeCollection = Backbone.Collection.extend({
    model: this.Metacode,
    url: '/metacodes',
    comparator: function (a, b) {
      a = a.get('name').toLowerCase()
      b = b.get('name').toLowerCase()
      return a > b ? 1 : a < b ? -1 : 0
    }
  })

  self.Topic = Backbone.Model.extend({
    urlRoot: '/topics',
    blacklist: ['node', 'created_at', 'updated_at', 'user_name', 'user_image', 'map_count', 'synapse_count'],
    toJSON: function (options) {
      return _.omit(this.attributes, this.blacklist)
    },
    save: function (key, val, options) {
      var attrs

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key
        options = val
      } else {
        (attrs = {})[key] = val
      }

      var newOptions = options || {}
      var s = newOptions.success

      var permBefore = this.get('permission')

      newOptions.success = function (model, response, opt) {
        if (s) s(model, response, opt)
        model.trigger('saved')

        if (permBefore === 'private' && model.get('permission') !== 'private') {
          model.trigger('noLongerPrivate')
        }
        else if (permBefore !== 'private' && model.get('permission') === 'private') {
          model.trigger('nowPrivate')
        }
      }
      return Backbone.Model.prototype.save.call(this, attrs, newOptions)
    },
    initialize: function () {
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
      this.on('saved', this.savedEvent)
      this.on('nowPrivate', function () {
        var removeTopicData = {
          mappableid: this.id
        }

        $(document).trigger(JIT.events.removeTopic, [removeTopicData])
      })
      this.on('noLongerPrivate', function () {
        var newTopicData = {
          mappingid: this.getMapping().id,
          mappableid: this.id
        }

        $(document).trigger(JIT.events.newTopic, [newTopicData])
      })

      this.on('change:metacode_id', Filter.checkMetacodes, this)
    },
    authorizeToEdit: function (mapper) {
      if (mapper &&
        (this.get('user_id') === mapper.get('id') ||
         this.get('calculated_permission') === 'commons' ||
         this.get('collaborator_ids').includes(mapper.get('id')))) {
        return true
      } else {
        return false
      }
    },
    authorizePermissionChange: function (mapper) {
      if (mapper && this.get('user_id') === mapper.get('id')) return true
      else return false
    },
    getDate: function () {},
    getMetacode: function () {
      return Metamaps.Metacodes.get(this.get('metacode_id'))
    },
    getMapping: function () {
      if (!Active.Map) return false

      return Metamaps.Mappings.findWhere({
        map_id: Active.Map.id,
        mappable_type: 'Topic',
        mappable_id: this.isNew() ? this.cid : this.id
      })
    },
    createNode: function () {
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
    updateNode: function () {
      var mapping
      var node = this.get('node')
      node.setData('topic', this)

      if (Active.Map) {
        mapping = this.getMapping()
        node.setData('mapping', mapping)
      }

      return node
    },
    savedEvent: function () {
      Realtime.updateTopic(this)
    },
    updateViews: function () {
      var onPageWithTopicCard = Active.Map || Active.Topic
      var node = this.get('node')
      // update topic card, if this topic is the one open there
      if (onPageWithTopicCard && this == TopicCard.openTopicCard) {
        TopicCard.showCard(node)
      }

      // update the node on the map
      if (onPageWithTopicCard && node) {
        node.name = this.get('name')
        Visualize.mGraph.plot()
      }
    },
    updateCardView: function () {
      var onPageWithTopicCard = Active.Map || Active.Topic
      var node = this.get('node')
      // update topic card, if this topic is the one open there
      if (onPageWithTopicCard && this == TopicCard.openTopicCard) {
        TopicCard.showCard(node)
      }
    },
    updateNodeView: function () {
      var onPageWithTopicCard = Active.Map || Active.Topic
      var node = this.get('node')

      // update the node on the map
      if (onPageWithTopicCard && node) {
        node.name = this.get('name')
        Visualize.mGraph.plot()
      }
    }
  })

  self.TopicCollection = Backbone.Collection.extend({
    model: self.Topic,
    url: '/topics'
  })

  self.Synapse = Backbone.Model.extend({
    urlRoot: '/synapses',
    blacklist: ['edge', 'created_at', 'updated_at'],
    toJSON: function (options) {
      return _.omit(this.attributes, this.blacklist)
    },
    save: function (key, val, options) {
      var attrs

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key
        options = val
      } else {
        (attrs = {})[key] = val
      }

      var newOptions = options || {}
      var s = newOptions.success

      var permBefore = this.get('permission')

      newOptions.success = function (model, response, opt) {
        if (s) s(model, response, opt)
        model.trigger('saved')

        if (permBefore === 'private' && model.get('permission') !== 'private') {
          model.trigger('noLongerPrivate')
        }
        else if (permBefore !== 'private' && model.get('permission') === 'private') {
          model.trigger('nowPrivate')
        }
      }
      return Backbone.Model.prototype.save.call(this, attrs, newOptions)
    },
    initialize: function () {
      if (this.isNew()) {
        this.set({
          'user_id': Active.Mapper.id,
          'permission': Active.Map ? Active.Map.get('permission') : 'commons',
          'category': 'from-to'
        })
      }

      this.on('changeByOther', this.updateCardView)
      this.on('change', this.updateEdgeView)
      this.on('saved', this.savedEvent)
      this.on('noLongerPrivate', function () {
        var newSynapseData = {
          mappingid: this.getMapping().id,
          mappableid: this.id
        }

        $(document).trigger(JIT.events.newSynapse, [newSynapseData])
      })
      this.on('nowPrivate', function () {
        $(document).trigger(JIT.events.removeSynapse, [{
          mappableid: this.id
        }])
      })

      this.on('change:desc', Filter.checkSynapses, this)
    },
    prepareLiForFilter: function () {
      var li = ''
      li += '<li data-id="' + this.get('desc') + '">'
      li += '<img src="' + Metamaps.Erb['synapse16.png'] + '"'
      li += ' alt="synapse icon" />'
      li += '<p>' + this.get('desc') + '</p></li>'
      return li
    },
    authorizeToEdit: function (mapper) {
      if (mapper && (this.get('calculated_permission') === 'commons' || this.get('collaborator_ids').includes(mapper.get('id')) || this.get('user_id') === mapper.get('id'))) return true
      else return false
    },
    authorizePermissionChange: function (mapper) {
      if (mapper && this.get('user_id') === mapper.get('id')) return true
      else return false
    },
    getTopic1: function () {
      return Metamaps.Topics.get(this.get('topic1_id'))
    },
    getTopic2: function () {
      return Metamaps.Topics.get(this.get('topic2_id'))
    },
    getDirection: function () {
      var t1 = this.getTopic1(),
        t2 = this.getTopic2()

      return t1 && t2 ? [
        t1.get('node').id,
        t2.get('node').id
      ] : false
    },
    getMapping: function () {
      if (!Active.Map) return false

      return Metamaps.Mappings.findWhere({
        map_id: Active.Map.id,
        mappable_type: 'Synapse',
        mappable_id: this.isNew() ? this.cid : this.id
      })
    },
    createEdge: function (providedMapping) {
      var mapping, mappingID
      var synapseID = this.isNew() ? this.cid : this.id

      var edge = {
        nodeFrom: this.get('topic1_id'),
        nodeTo: this.get('topic2_id'),
        data: {
          $synapses: [],
          $synapseIDs: [synapseID],
        }
      }

      if (Active.Map) {
        mapping = providedMapping || this.getMapping()
        mappingID = mapping.isNew() ? mapping.cid : mapping.id
        edge.data.$mappings = []
        edge.data.$mappingIDs = [mappingID]
      }

      return edge
    },
    updateEdge: function () {
      var mapping
      var edge = this.get('edge')
      edge.getData('synapses').push(this)

      if (Active.Map) {
        mapping = this.getMapping()
        edge.getData('mappings').push(mapping)
      }

      return edge
    },
    savedEvent: function () {
      Realtime.updateSynapse(this)
    },
    updateViews: function () {
      this.updateCardView()
      this.updateEdgeView()
    },
    updateCardView: function () {
      var onPageWithSynapseCard = Active.Map || Active.Topic
      var edge = this.get('edge')

      // update synapse card, if this synapse is the one open there
      if (onPageWithSynapseCard && edge == SynapseCard.openSynapseCard) {
        SynapseCard.showCard(edge)
      }
    },
    updateEdgeView: function () {
      var onPageWithSynapseCard = Active.Map || Active.Topic
      var edge = this.get('edge')

      // update the edge on the map
      if (onPageWithSynapseCard && edge) {
        Visualize.mGraph.plot()
      }
    }
  })

  self.SynapseCollection = Backbone.Collection.extend({
    model: self.Synapse,
    url: '/synapses'
  })

  self.Mapping = Backbone.Model.extend({
    urlRoot: '/mappings',
    blacklist: ['created_at', 'updated_at'],
    toJSON: function (options) {
      return _.omit(this.attributes, this.blacklist)
    },
    initialize: function () {
      if (this.isNew()) {
        this.set({
          'user_id': Active.Mapper.id,
          'map_id': Active.Map ? Active.Map.id : null
        })
      }
    },
    getMap: function () {
      return Map.get(this.get('map_id'))
    },
    getTopic: function () {
      if (this.get('mappable_type') === 'Topic') return Topic.get(this.get('mappable_id'))
      else return false
    },
    getSynapse: function () {
      if (this.get('mappable_type') === 'Synapse') return Synapse.get(this.get('mappable_id'))
      else return false
    }
  })

  self.MappingCollection = Backbone.Collection.extend({
    model: self.Mapping,
    url: '/mappings'
  })

  Metamaps.Metacodes = Metamaps.Metacodes ? new self.MetacodeCollection(Metamaps.Metacodes) : new self.MetacodeCollection()

  Metamaps.Topics = Metamaps.Topics ? new self.TopicCollection(Metamaps.Topics) : new self.TopicCollection()

  Metamaps.Synapses = Metamaps.Synapses ? new self.SynapseCollection(Metamaps.Synapses) : new self.SynapseCollection()

  Metamaps.Mappers = Metamaps.Mappers ? new self.MapperCollection(Metamaps.Mappers) : new self.MapperCollection()

  Metamaps.Collaborators = Metamaps.Collaborators ? new self.MapperCollection(Metamaps.Collaborators) : new self.MapperCollection()

  // this is for topic view
  Metamaps.Creators = Metamaps.Creators ? new self.MapperCollection(Metamaps.Creators) : new self.MapperCollection()

  if (Active.Map) {
    Metamaps.Mappings = Metamaps.Mappings ? new self.MappingCollection(Metamaps.Mappings) : new self.MappingCollection()

    Active.Map = new self.Map(Active.Map)
  }

  if (Active.Topic) Active.Topic = new self.Topic(Active.Topic)

  // attach collection event listeners
  self.attachCollectionEvents = function () {
    Metamaps.Topics.on('add remove', function (topic) {
      InfoBox.updateNumbers()
      Filter.checkMetacodes()
      Filter.checkMappers()
    })

    Metamaps.Synapses.on('add remove', function (synapse) {
      InfoBox.updateNumbers()
      Filter.checkSynapses()
      Filter.checkMappers()
    })

    if (Active.Map) {
      Metamaps.Mappings.on('add remove', function (mapping) {
        InfoBox.updateNumbers()
        Filter.checkSynapses()
        Filter.checkMetacodes()
        Filter.checkMappers()
      })
    }
  }
  self.attachCollectionEvents()
}; // end _Backbone.init

export default _Backbone

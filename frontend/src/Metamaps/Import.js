/* global Metamaps, $ */

import parse from 'csv-parse'
import _ from 'lodash'

import Active from './Active'
import AutoLayout from './AutoLayout'
import GlobalUI from './GlobalUI'
import Map from './Map'
import Synapse from './Synapse'
import Topic from './Topic'

/*
 * Metamaps.Import.js.erb
 *
 * Dependencies:
 *  - Metamaps.Backbone
 *  - Metamaps.Mappings
 *  - Metamaps.Metacodes
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 */

const Import = {
  // note that user is not imported
  topicWhitelist: [
    'id', 'name', 'metacode', 'x', 'y', 'description', 'link', 'permission'
  ],
  synapseWhitelist: [
    'topic1', 'topic2', 'category', 'direction', 'desc', 'description', 'permission'
  ],
  cidMappings: {}, // to be filled by import_id => cid mappings

  handleTSV: function (text) {
    const results = Import.parseTabbedString(text)
    Import.handle(results)
  },

  handleCSV: function (text, parserOpts = {}) {
    const self = Import

    const topicsRegex = /("?Topics"?)([\s\S]*)/mi
    const synapsesRegex = /("?Synapses"?)([\s\S]*)/mi
    let topicsText = text.match(topicsRegex) || ''
    if (topicsText) topicsText = topicsText[2].replace(synapsesRegex, '')
    let synapsesText = text.match(synapsesRegex) || ''
    if (synapsesText) synapsesText = synapsesText[2].replace(topicsRegex, '')

    // merge default options and extra options passed in parserOpts argument
    const csv_parser_options = Object.assign({
      columns: true, // get headers
      relax_column_count: true,
      skip_empty_lines: true
    }, parserOpts)

    const topicsPromise = $.Deferred()
    parse(topicsText, csv_parser_options, (err, data) => {
      if (err) {
        console.warn(err)
        return topicsPromise.resolve([])
      }
      topicsPromise.resolve(data)
    })

    const synapsesPromise = $.Deferred()
    parse(synapsesText, csv_parser_options, (err, data) => {
      if (err) {
        console.warn(err)
        return synapsesPromise.resolve([])
      }
      synapsesPromise.resolve(data)
    })

    $.when(topicsPromise, synapsesPromise).done((topics, synapses) => {
      self.handle({ topics, synapses})
    })
  },

  handleJSON: function (text) {
    const results = JSON.parse(text)
    Import.handle(results)
  },

  handle: function(results) {
    var self = Import
    var topics = results.topics.map(topic => self.normalizeKeys(topic))
    var synapses = results.synapses.map(synapse => self.normalizeKeys(synapse))

    if (topics.length > 0 || synapses.length > 0) {
      if (window.confirm('Are you sure you want to create ' + topics.length +
          ' new topics and ' + synapses.length + ' new synapses?')) {
        self.importTopics(topics)
        window.setTimeout(() => self.importSynapses(synapses), 5000)
      } // if
    } // if
  },

  parseTabbedString: function (text) {
    var self = Import

    // determine line ending and split lines
    var delim = '\n'
    if (text.indexOf('\r\n') !== -1) {
      delim = '\r\n'
    } else if (text.indexOf('\r') !== -1) {
      delim = '\r'
    } // if

    var STATES = {
      ABORT: -1,
      UNKNOWN: 0,
      TOPICS_NEED_HEADERS: 1,
      SYNAPSES_NEED_HEADERS: 2,
      TOPICS: 3,
      SYNAPSES: 4
    }

    // state & lines determine parser behaviour
    var state = STATES.UNKNOWN
    var lines = text.split(delim)
    var results = { topics: [], synapses: [] }
    var topicHeaders = []
    var synapseHeaders = []

    lines.forEach(function (line_raw, index) {
      var line = line_raw.split('\t')
      var noblanks = line.filter(function (elt) {
        return elt !== ''
      })
      switch (state) {
        case STATES.UNKNOWN:
          if (noblanks.length === 0) {
            state = STATES.UNKNOWN
            break
          } else if (noblanks.length === 1 && self.simplify(line[0]) === 'topics') {
            state = STATES.TOPICS_NEED_HEADERS
            break
          } else if (noblanks.length === 1 && self.simplify(line[0]) === 'synapses') {
            state = STATES.SYNAPSES_NEED_HEADERS
            break
          }
          state = STATES.TOPICS_NEED_HEADERS
          // FALL THROUGH - if we're not sure what to do, pretend
          // we're on the TOPICS_NEED_HEADERS state and parse some headers

        case STATES.TOPICS_NEED_HEADERS: // eslint-disable-line no-fallthrough
          if (noblanks.length < 2) {
            self.abort('Not enough topic headers on line ' + index)
            state = STATES.ABORT
          }
          topicHeaders = line.map(function (header, index) {
            return self.normalizeKey(header)
          })
          state = STATES.TOPICS
          break

        case STATES.SYNAPSES_NEED_HEADERS:
          if (noblanks.length < 2) {
            self.abort('Not enough synapse headers on line ' + index)
            state = STATES.ABORT
          }
          synapseHeaders = line.map(function (header, index) {
            return self.normalizeKey(header)
          })
          state = STATES.SYNAPSES
          break

        case STATES.TOPICS:
          if (noblanks.length === 0) {
            state = STATES.UNKNOWN
          } else if (noblanks.length === 1 && line[0].toLowerCase() === 'topics') {
            state = STATES.TOPICS_NEED_HEADERS
          } else if (noblanks.length === 1 && line[0].toLowerCase() === 'synapses') {
            state = STATES.SYNAPSES_NEED_HEADERS
          } else {
            var topic = {}
            line.forEach(function (field, index) {
              var header = topicHeaders[index]
              if (self.topicWhitelist.indexOf(header) === -1) return
              topic[header] = field
              if (['id', 'x', 'y'].indexOf(header) !== -1) {
                topic[header] = parseInt(topic[header])
              } // if
            })
            results.topics.push(topic)
          }
          break

        case STATES.SYNAPSES:
          if (noblanks.length === 0) {
            state = STATES.UNKNOWN
          } else if (noblanks.length === 1 && line[0].toLowerCase() === 'topics') {
            state = STATES.TOPICS_NEED_HEADERS
          } else if (noblanks.length === 1 && line[0].toLowerCase() === 'synapses') {
            state = STATES.SYNAPSES_NEED_HEADERS
          } else {
            var synapse = {}
            line.forEach(function (field, index) {
              var header = synapseHeaders[index]
              if (self.synapseWhitelist.indexOf(header) === -1) return
              synapse[header] = field
              if (['id', 'topic1', 'topic2'].indexOf(header) !== -1) {
                synapse[header] = parseInt(synapse[header])
              } // if
            })
            results.synapses.push(synapse)
          }
          break
        case STATES.ABORT:
          // FALL THROUGH
        default: // eslint-disable-line no-fallthrough
          self.abort('Invalid state while parsing import data. Check code.')
          state = STATES.ABORT
      }
    })

    if (state === STATES.ABORT) {
      return false
    } else {
      return results
    }
  },

  importTopics: function (parsedTopics) {
    var self = Import

    parsedTopics.forEach(topic => {
      let coords = { x: topic.x, y: topic.y }
      if (!coords.x || !coords.y) {
        coords = AutoLayout.getNextCoord({ mappings: Metamaps.Mappings })
      }

      if (!topic.name && topic.link ||
          topic.name && topic.link && !topic.metacode) {
        self.handleURL(topic.link, {
          coords,
          name: topic.name,
          permission: topic.permission,
          import_id: topic.id
        })
        return // "continue"
      }

      self.createTopicWithParameters(
        topic.name, topic.metacode, topic.permission,
        topic.desc, topic.link, coords.x, coords.y, topic.id
      )
    })
  },

  importSynapses: function (parsedSynapses) {
    var self = Import

    parsedSynapses.forEach(function (synapse) {
      // only createSynapseWithParameters once both topics are persisted
      // if there isn't a cidMapping, check by topic name instead
      var topic1 = Metamaps.Topics.get(self.cidMappings[synapse.topic1])
      if (!topic1) topic1 = Metamaps.Topics.findWhere({ name: synapse.topic1 })
      var topic2 = Metamaps.Topics.get(self.cidMappings[synapse.topic2])
      if (!topic2) topic2 = Metamaps.Topics.findWhere({ name: synapse.topic2 })

      if (!topic1 || !topic2) {
        console.error("One of the two topics doesn't exist!")
        console.error(synapse)
        return // next
      }

      self.createSynapseWithParameters(
        synapse.desc, synapse.category, synapse.permission,
        topic1, topic2
      )
    })
  },

  createTopicWithParameters: function (name, metacode_name, permission, desc,
    link, xloc, yloc, import_id, opts = {}) {
    var self = Import
    $(document).trigger(Map.events.editedByActiveMapper)
    var metacode = Metamaps.Metacodes.where({name: metacode_name})[0] || null
    if (metacode === null) {
      metacode = Metamaps.Metacodes.where({ name: 'Wildcard' })[0]
      console.warn("Couldn't find metacode " + metacode_name + ' so used Wildcard instead.')
    }

    var topic_permission = permission || Active.Map.get('permission')
    var defer_to_map_id = permission === topic_permission ? Active.Map.get('id') : null
    var topic = new Metamaps.Backbone.Topic({
      name: name,
      metacode_id: metacode.id,
      permission: topic_permission,
      defer_to_map_id: defer_to_map_id,
      desc: desc || '',
      link: link || '',
      calculated_permission: Active.Map.get('permission')
    })
    Metamaps.Topics.add(topic)

    if (import_id !== null && import_id !== undefined) {
      self.cidMappings[import_id] = topic.cid
    }

    var mapping = new Metamaps.Backbone.Mapping({
      xloc: xloc,
      yloc: yloc,
      mappable_id: topic.cid,
      mappable_type: 'Topic'
    })
    Metamaps.Mappings.add(mapping)

    // this function also includes the creation of the topic in the database
    Topic.renderTopic(mapping, topic, true, true, {
      success: opts.success
    })

    GlobalUI.hideDiv('#instructions')
  },

  createSynapseWithParameters: function (desc, category, permission,
    topic1, topic2) {
    var node1 = topic1.get('node')
    var node2 = topic2.get('node')

    if (!topic1.id || !topic2.id) {
      console.error('missing topic id when creating synapse')
      return
    } // if

    var synapse = new Metamaps.Backbone.Synapse({
      desc: desc || '',
      category: category || 'from-to',
      permission: permission,
      topic1_id: topic1.id,
      topic2_id: topic2.id
    })
    Metamaps.Synapses.add(synapse)

    var mapping = new Metamaps.Backbone.Mapping({
      mappable_type: 'Synapse',
      mappable_id: synapse.cid
    })
    Metamaps.Mappings.add(mapping)

    Synapse.renderSynapse(mapping, synapse, node1, node2, true)
  },

  handleURL: function (url, opts = {}) {
    let coords = opts.coords
    if (!coords || coords.x === undefined || coords.y === undefined) {
      coords = AutoLayout.getNextCoord({ mappings: Metamaps.Mappings })
    }

    const name = opts.name || 'Link'
    const metacode = opts.metacode || 'Reference'
    const import_id = opts.import_id || null // don't store a cidMapping
    const permission = opts.permission || null // use default
    const desc = opts.desc || url

    Import.createTopicWithParameters(
      name,
      metacode,
      permission,
      desc,
      url,
      coords.x,
      coords.y,
      import_id,
      {
        success: function(topic) {
          if (topic.get('name') !== 'Link') return
          $.get('/hacks/load_url_title', {
            url
          }, function success(data, textStatus) {
            var selector = '#showcard #topic_' + topic.get('id') + ' .best_in_place'
            if ($(selector).find('form').length > 0) {
              $(selector).find('textarea, input').val(data.title)
            } else {
              $(selector).html(data.title)
            }
            topic.set('name', data.title)
            topic.save()
          })
        }
      }
    )
  },

  /*
   * helper functions
   */

  abort: function (message) {
    console.error(message)
  },

  // TODO investigate replacing with es6 (?) trim()
  simplify: function (string) {
    return string
      .replace(/(^\s*|\s*$)/g, '')
      .toLowerCase()
  },

  normalizeKey: function(key) {
    let newKey = key.toLowerCase()
    newKey = newKey.replace(/\s/g, '') // remove whitespace
    if (newKey === 'url') newKey = 'link'
    if (newKey === 'title') newKey = 'name'
    if (newKey === 'label') newKey = 'desc'
    if (newKey === 'description') newKey = 'desc'
    if (newKey === 'direction') newKey = 'category'
    return newKey
  },

  // thanks to http://stackoverflow.com/a/25290114/5332286
  normalizeKeys: function(obj) {
    return _.transform(obj, (result, val, key) => {
      const newKey = Import.normalizeKey(key)
      result[newKey] = val
    })
  }
}

export default Import

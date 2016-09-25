/* global Metamaps, $ */

import parse from 'csv-parse'
import _ from 'lodash'

import Active from './Active'
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
    'topic1', 'topic2', 'category', 'desc', 'description', 'permission'
  ],
  cidMappings: {}, // to be filled by import_id => cid mappings

  handleTSV: function (text) {
    var self = Import
    results = self.parseTabbedString(text)
    self.handle(results)
  },

  handleCSV: function (text, parserOpts = {}) {
    var self = Import

    const topicsRegex = /("?Topics"?)([\s\S]*)/mi
    const synapsesRegex = /("?Synapses"?)([\s\S]*)/mi
    let topicsText = text.match(topicsRegex)
    if (topicsText) topicsText = topicsText[2].replace(synapsesRegex, '')
    let synapsesText = text.match(synapsesRegex)
    if (synapsesText) synapsesText = synapsesText[2].replace(topicsRegex, '')

    // merge default options and extra options passed in parserOpts argument
    const csv_parser_options = Object.assign({
      columns: true, // get headers
      relax_column_count: true,
      skip_empty_lines: true
    }, parserOpts)

    const topicsPromise = $.Deferred()
    parse(topicsText, csv_parser_options, (err, data) => {
      if (err) topicsPromise.reject(err)
      topicsPromise.resolve(data.map(row => self.lowercaseKeys(row)))
    })

    const synapsesPromise = $.Deferred()
    parse(synapsesText, csv_parser_options, (err, data) => {
      if (err) synapsesPromise.reject(err)
      synapsesPromise.resolve(data.map(row => self.lowercaseKeys(row)))
    })

    $.when(topicsPromise, synapsesPromise).done((topics, synapses) => {
      self.handle({ topics, synapses})
    })
  },

  handleJSON: function (text) {
    var self = Import
    results = JSON.parse(text)
    self.handle(results)
  },

  handle: function(results) {
    var self = Import
    var topics = results.topics
    var synapses = results.synapses

    if (topics.length > 0 || synapses.length > 0) {
      if (window.confirm('Are you sure you want to create ' + topics.length +
          ' new topics and ' + synapses.length + ' new synapses?')) {
        self.importTopics(topics)
        self.importSynapses(synapses)
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

        case STATES.TOPICS_NEED_HEADERS: // eslint-disable-line
          if (noblanks.length < 2) {
            self.abort('Not enough topic headers on line ' + index)
            state = STATES.ABORT
          }
          topicHeaders = line.map(function (header, index) {
            return header.toLowerCase().replace('description', 'desc')
          })
          state = STATES.TOPICS
          break

        case STATES.SYNAPSES_NEED_HEADERS:
          if (noblanks.length < 2) {
            self.abort('Not enough synapse headers on line ' + index)
            state = STATES.ABORT
          }
          synapseHeaders = line.map(function (header, index) {
            return header.toLowerCase().replace('description', 'desc')
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

        default:
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

    // up to 25 topics: scale 100
    // up to 81 topics: scale 200
    // up to 169 topics: scale 300
    var scale = Math.floor((Math.sqrt(parsedTopics.length) - 1) / 4) * 100
    if (scale < 100) scale = 100
    var autoX = -scale
    var autoY = -scale

    parsedTopics.forEach(function (topic) {
      var x, y
      if (topic.x && topic.y) {
        x = topic.x
        y = topic.y
      } else {
        x = autoX
        y = autoY
        autoX += 50
        if (autoX > scale) {
          autoY += 50
          autoX = -scale
        }
      }

      self.createTopicWithParameters(
        topic.name, topic.metacode, topic.permission,
        topic.desc, topic.link, x, y, topic.id
      )
    })
  },

  importSynapses: function (parsedSynapses) {
    var self = Import

    parsedSynapses.forEach(function (synapse) {
      // only createSynapseWithParameters once both topics are persisted
      var topic1 = Metamaps.Topics.get(self.cidMappings[synapse.topic1])
      var topic2 = Metamaps.Topics.get(self.cidMappings[synapse.topic2])
      if (!topic1 || !topic2) {
        console.error("One of the two topics doesn't exist!")
        console.error(synapse)
        return true
      }

      // ensure imported topics have a chance to get a real id attr before creating synapses
      const topic1Promise = $.Deferred()
      topic1.once('sync', () => topic1Promise.resolve())
      const topic2Promise = $.Deferred()
      topic2.once('sync', () => topic2Promise.resolve())
      $.when(topic1Promise, topic2Promise).done(() => {
        self.createSynapseWithParameters(
          synapse.desc, synapse.category, synapse.permission,
          topic1, topic2
        )
      })
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
      desc: desc || "",
      link: link || "",
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
      desc: desc || "",
      category: category,
      permission: permission,
      node1_id: topic1.id,
      node2_id: topic2.id
    })
    Metamaps.Synapses.add(synapse)

    var mapping = new Metamaps.Backbone.Mapping({
      mappable_type: 'Synapse',
      mappable_id: synapse.cid
    })
    Metamaps.Mappings.add(mapping)

    Synapse.renderSynapse(mapping, synapse, node1, node2, true)
  },

  /*
   * helper functions
   */

  abort: function (message) {
    console.error(message)
  },

  simplify: function (string) {
    return string
      .replace(/(^\s*|\s*$)/g, '')
      .toLowerCase()
  },


  // thanks to http://stackoverflow.com/a/25290114/5332286
  lowercaseKeys: function(obj) {
    return _.transform(obj, (result, val, key) => {
      result[key.toLowerCase()] = val
    })
  }
}

export default Import

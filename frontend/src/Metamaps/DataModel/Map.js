/* global $ */

import _ from 'lodash'
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Active from '../Active'
import InfoBox from '../Map/InfoBox'
import Mapper from '../Mapper'

const Map = Backbone.Model.extend({
  urlRoot: '/maps',
  blacklist: ['created_at', 'updated_at', 'created_at_clean', 'updated_at_clean', 'user_name', 'contributor_count', 'topic_count', 'synapse_count', 'topics', 'synapses', 'mappings', 'mappers'],
  toJSON: function(options) {
    return _.omit(this.attributes, this.blacklist)
  },
  initialize: function() {
    this.on('changeByOther', this.updateView)
  },
  authorizeToEdit: function(mapper) {
    if (mapper && (
      this.get('permission') === 'commons' ||
      (this.get('collaborator_ids') || []).includes(mapper.get('id')) ||
      this.get('user_id') === mapper.get('id'))) {
      return true
    } else {
      return false
    }
  },
  authorizePermissionChange: function(mapper) {
    if (mapper && this.get('user_id') === mapper.get('id')) {
      return true
    } else {
      return false
    }
  },
  isFollowedBy: function(mapper) {
    return mapper && mapper.get('follows') && mapper.get('follows').maps.indexOf(this.get('id')) > -1
  },
  getUser: function() {
    return Mapper.get(this.get('user_id'))
  },
  updateView: function() {
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
  updateMapWrapper: function() {
    var map = Active.Map
    var isActiveMap = this.id === map.id
    var authorized = map && map.authorizeToEdit(Active.Mapper) ? 'canEditMap' : ''
    var commonsMap = map && map.get('permission') === 'commons' ? 'commonsMap' : ''
    if (isActiveMap) {
      $('.wrapper').removeClass('canEditMap commonsMap').addClass(authorized + ' ' + commonsMap)
    }
  }
})

export default Map

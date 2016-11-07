/* global $ */

import React from 'react'
import ReactDOM from 'react-dom' // TODO ensure this isn't a double import

import Active from '../Active'
import DataModel from '../DataModel'
import GlobalUI from '../GlobalUI'
import Realtime from '../Realtime'
import Loading from '../Loading'
import Maps from '../../components/Maps'

const ExploreMaps = {
  pending: false,
  mapper: null,
  setCollection: function(collection) {
    var self = ExploreMaps

    if (self.collection) {
      self.collection.off('add', self.render)
      self.collection.off('successOnFetch', self.handleSuccess)
      self.collection.off('errorOnFetch', self.handleError)
    }
    self.collection = collection
    self.collection.on('add', self.render)
    self.collection.on('successOnFetch', self.handleSuccess)
    self.collection.on('errorOnFetch', self.handleError)
  },
  render: function(cb) {
    var self = ExploreMaps

    if (!self.collection) return

    var exploreObj = {
      currentUser: Active.Mapper,
      section: self.collection.id,
      maps: self.collection,
      juntoState: Realtime.juntoState,
      moreToLoad: self.collection.page !== 'loadedAll',
      user: self.collection.id === 'mapper' ? self.mapper : null,
      loadMore: self.loadMore,
      pending: self.pending,
      onStar: function(map) {
        $.post('/maps/' + map.id + '/star')
        map.set('star_count', map.get('star_count') + 1)
        if (DataModel.Stars) DataModel.Stars.push({ user_id: Active.Mapper.id, map_id: map.id })
        DataModel.Maps.Starred.add(map)
        GlobalUI.notifyUser('Map is now starred')
        self.render()
      },
      onRequest: function(map) {
        $.post({
          url: `/maps/${map.id}/access_request`
        })
        GlobalUI.notifyUser('You will be notified by email if request accepted')
      }
    }
    ReactDOM.render(
      React.createElement(Maps, exploreObj),
      document.getElementById('explore')
    ).resize()

    if (cb) cb()
    Loading.hide()
  },
  loadMore: function() {
    var self = ExploreMaps
    if (self.collection.page !== 'loadedAll') {
      self.collection.getMaps()
      self.pending = true
    }
    self.render()
  },
  handleSuccess: function(cb) {
    var self = ExploreMaps
    self.pending = false
    if (self.collection && self.collection.id === 'mapper') {
      self.fetchUserThenRender(cb)
    } else {
      self.render(cb)
      Loading.hide()
    }
  },
  handleError: function() {
    console.log('error loading maps!') // TODO
    Loading.hide()
  },
  fetchUserThenRender: function(cb) {
    var self = ExploreMaps

    if (self.mapper && self.mapper.id === self.collection.mapperId) {
      self.render(cb)
      return Loading.hide()
    }

    // first load the mapper object and then call the render function
    $.ajax({
      url: '/users/' + self.collection.mapperId + '/details.json',
      success: function(response) {
        self.mapper = response
        self.render(cb)
        Loading.hide()
      },
      error: function() {
        self.render(cb)
        Loading.hide()
      }
    })
  }
}

export default ExploreMaps

/* global Metamaps, $ */

import React from 'react'
import ReactDOM from 'react-dom' // TODO ensure this isn't a double import

import Active from '../Active'
import GlobalUI from '../GlobalUI'
import Realtime from '../Realtime'
import Maps from '../../components/Maps'

/*
 *  - Metamaps.Loading
 */

const ExploreMaps = {
  setCollection: function (collection) {
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
  render: function (mapperObj, cb) {
    var self = ExploreMaps

    if (!self.collection) return

    if (typeof mapperObj === 'function') {
      cb = mapperObj
      mapperObj = null
    }
    
    var exploreObj = { 
      currentUser: Active.Mapper,
      section: self.collection.id,
      maps: self.collection,
      juntoState: Realtime.juntoState,
      moreToLoad: self.collection.page != 'loadedAll',
      user: mapperObj,
      loadMore: self.loadMore,
      onStar: function (map) {
        $.post('/maps/' + map.id + '/star')
        map.set('star_count', map.get('star_count') + 1)
        if (Metamaps.Stars) Metamaps.Stars.push({ user_id: Active.Mapper.id, map_id: map.id })
        Metamaps.Maps.Starred.add(map)
        GlobalUI.notifyUser('Map is now starred')
        self.render()
      },
      onRequest: function (map) {
        $.post({
          url: `/maps/${map.id}/access_request`
        })
        GlobalUI.notifyUser('You will be notified by email if request accepted') 
      }
    }
    ReactDOM.render(
      React.createElement(Maps, exploreObj),
      document.getElementById('explore')
    )
    
    if (cb) cb()
    Metamaps.Loading.hide()
  },
  loadMore: function () {
    var self = ExploreMaps

    if (self.collection.page != "loadedAll") {
      self.collection.getMaps()
    }
    else self.render()
  },
  handleSuccess: function (cb) {
    var self = ExploreMaps

    if (self.collection && self.collection.id === 'mapper') {
      self.fetchUserThenRender(cb)
    } else {
      self.render(cb)
    }
  },
  handleError: function () {
    console.log('error loading maps!') // TODO
  },
  fetchUserThenRender: function (cb) {
    var self = ExploreMaps
    
    // first load the mapper object and then call the render function
    $.ajax({
      url: '/users/' + self.collection.mapperId + '/details.json',
      success: function (response) {
        self.render(response, cb)
      },
      error: function () {
        self.render(cb)
      }
    })
  }
}

export default ExploreMaps

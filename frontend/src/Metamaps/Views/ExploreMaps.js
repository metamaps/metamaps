/* global $ */

import Active from '../Active'
import DataModel from '../DataModel'
import GlobalUI, { ReactApp } from '../GlobalUI'
import Loading from '../Loading'

const ExploreMaps = {
  pending: false,
  mapper: null,
  updateFromPath: function(path) {
    const self = ExploreMaps
    const [_unused, generalSection, specificSection, id] = path.split('/')

    if (generalSection === 'explore') {
      const capitalize = specificSection.charAt(0).toUpperCase() + specificSection.slice(1)
      self.setCollection(DataModel.Maps[capitalize])
      switch (capitalize) {
        case 'Active':
          document.title = 'Explore Active Maps | Metamaps'
          ReactApp.mobileTitle = 'Recently Active'
          break
        case 'Featured':
          document.title = 'Explore Featured Maps | Metamaps'
          ReactApp.mobileTitle = 'Featured Maps'
          break
        case 'Starred':
          document.title = 'Starred Maps | Metamaps'
          ReactApp.mobileTitle = 'Starred Maps'
          break
        case 'Shared':
          document.title = 'Shared Maps | Metamaps'
          ReactApp.mobileTitle = 'Shared With Me'
          break
        case 'Mine':
          document.title = 'My Maps | Metamaps'
          ReactApp.mobileTitle = 'My Maps'
          break
      }
    } else if (generalSection === '') {
      self.setCollection(DataModel.Maps.Active)
      document.title = 'Explore Active Maps | Metamaps'
      ReactApp.mobileTitle = 'Recently Active'
    }

    if (id) {
      if (self.collection.mapperId !== id) {
        // empty the collection if we are trying to load the maps
        // collection of a different mapper than we had previously
        self.collection.reset()
        self.collection.page = 1
        self.render()
      }
      self.collection.mapperId = id
    }
    if (self.collection.length === 0) {
      Loading.show()
      self.pending = true
      self.collection.getMaps()
    } else {
      id ? self.fetchUserThenRender() : self.render()
    }
  },
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
  render: function() {
    ReactApp.resize()
    ReactApp.render()
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
  handleSuccess: function() {
    var self = ExploreMaps
    self.pending = false
    if (self.collection && self.collection.id === 'mapper') {
      self.fetchUserThenRender()
    } else {
      self.render()
    }
  },
  handleError: function() {
    console.log('error loading maps!') // TODO
    Loading.hide()
  },
  fetchUserThenRender: function(cb) {
    var self = ExploreMaps

    if (self.mapper && self.mapper.id === self.collection.mapperId) {
      self.render()
      return
    }

    // first load the mapper object and then call the render function
    $.ajax({
      url: '/users/' + self.collection.mapperId + '/details.json',
      success: function(response) {
        self.mapper = response
        document.title = self.mapper.name + ' | Metamaps'
        ReactApp.mobileTitle = self.mapper.name
        self.render()
      },
      error: function() {
        self.render()
      }
    })
  },
  onStar: function(map) {
    $.post('/maps/' + map.id + '/star')
    map.set('star_count', map.get('star_count') + 1)
    if (DataModel.Stars) DataModel.Stars.push({ user_id: Active.Mapper.id, map_id: map.id })
    DataModel.Maps.Starred.add(map)
    GlobalUI.notifyUser('Map is now starred')
    ReactApp.render()
  },
  onRequest: function(map) {
    $.post({
      url: `/maps/${map.id}/access_request`
    })
    GlobalUI.notifyUser('You will be notified by email if request accepted')
  },
  onMapFollow: function(map) {
    const isFollowing = map.isFollowedBy(Active.Mapper)
    $.post({
      url: `/maps/${map.id}/${isFollowing ? 'un' : ''}follow`
    })
    if (isFollowing) {
      GlobalUI.notifyUser('You are no longer following this map')
      Active.Mapper.unfollowMap(map.id)
    } else {
      GlobalUI.notifyUser('You are now following this map')
      Active.Mapper.followMap(map.id)
    }
    ReactApp.render()
  }
}

export default ExploreMaps

/* global Metamaps, $ */

/*
 * Metamaps.Views.js.erb
 *
 * Dependencies:
 *  - Metamaps.Loading
 *  - Metamaps.Active
 *  - Metamaps.ReactComponents
 */

Metamaps.Views = {
  exploreMaps: {
    setCollection: function (collection) {
      var self = Metamaps.Views.exploreMaps

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
      var self = Metamaps.Views.exploreMaps
  
      if (typeof mapperObj === 'function') {
        cb = mapperObj
        mapperObj = null
      }
      
      var exploreObj = { 
        currentUser: Metamaps.Active.Mapper,
        section: self.collection.id,
        displayStyle: 'grid',
        maps: self.collection,
        moreToLoad: self.collection.page != 'loadedAll',
        user: mapperObj,
        loadMore: self.loadMore
      }
      ReactDOM.render(
        React.createElement(Metamaps.ReactComponents.Maps, exploreObj),
        document.getElementById('explore')
      )
      
      if (cb) cb()
      Metamaps.Loading.hide()
    },
    loadMore: function () {
      var self = Metamaps.Views.exploreMaps

      if (self.collection.page != "loadedAll") {
        self.collection.getMaps()
      }
      else self.render()
    },
    handleSuccess: function (cb) {
      var self = Metamaps.Views.exploreMaps

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
      var self = Metamaps.Views.exploreMaps
      
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
}

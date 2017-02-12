/* global $ */

import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}

import Active from './Active'
import DataModel from './DataModel'
import GlobalUI from './GlobalUI'
import Loading from './Loading'
import Map from './Map'
import Topic from './Topic'
import Views from './Views'
import Visualize from './Visualize'

const _Router = Backbone.Router.extend({
  currentPage: '',
  currentSection: '',
  timeoutId: undefined,
  routes: {
    '': 'home', // #home
    'explore/:section': 'explore', // #explore/active
    'explore/:section/:id': 'explore', // #explore/mapper/1234
    'maps/:id': 'maps', // #maps/7
    'topics/:id': 'topics' // #topics/7
  },
  home: function() {
    let self = this
    clearTimeout(this.timeoutId)

    if (Active.Mapper) document.title = 'Explore Active Maps | Metamaps'
    else document.title = 'Home | Metamaps'

    this.currentSection = ''
    this.currentPage = ''
    $('.wrapper').removeClass('mapPage topicPage')

    var classes = Active.Mapper ? 'homePage explorePage' : 'homePage'
    $('.wrapper').addClass(classes)

    var navigate = function() {
      self.timeoutId = setTimeout(function() {
        self.navigateAndTrack('')
      }, 300)
    }

    // all this only for the logged in home page
    if (Active.Mapper) {
      $('.homeButton a').attr('href', '/')
      GlobalUI.hideDiv('#yield')

      GlobalUI.showDiv('#explore')

      Views.ExploreMaps.setCollection(DataModel.Maps.Active)
      if (DataModel.Maps.Active.length === 0) {
        Views.ExploreMaps.pending = true
        DataModel.Maps.Active.getMaps(navigate) // this will trigger an explore maps render
      } else {
        Views.ExploreMaps.render(navigate)
      }
    } else {
      // logged out home page
      GlobalUI.hideDiv('#explore')
      GlobalUI.showDiv('#yield')
      this.timeoutId = setTimeout(navigate, 500)
    }

    GlobalUI.hideDiv('#infovis')
    GlobalUI.hideDiv('#instructions')
    Map.end()
    Topic.end()
    Active.Map = null
    Active.Topic = null
  },
  explore: function(section, id) {
    var self = this
    clearTimeout(this.timeoutId)

    // just capitalize the variable section
    // either 'featured', 'mapper', or 'active'
    var capitalize = section.charAt(0).toUpperCase() + section.slice(1)

    if (section === 'shared' || section === 'featured' || section === 'active' || section === 'starred') {
      document.title = 'Explore ' + capitalize + ' Maps | Metamaps'
    } else if (section === 'mapper') {
      $.ajax({
        url: '/users/' + id + '.json',
        success: function(response) {
          document.title = response.name + ' | Metamaps'
        },
        error: function() {}
      })
    } else if (section === 'mine') {
      document.title = 'Explore My Maps | Metamaps'
    }

    if (Active.Mapper && section !== 'mapper') $('.homeButton a').attr('href', '/explore/' + section)
    $('.wrapper').removeClass('homePage mapPage topicPage')
    $('.wrapper').addClass('explorePage')

    this.currentSection = 'explore'
    this.currentPage = section

    // this will mean it's a mapper page being loaded
    if (id) {
      if (DataModel.Maps.Mapper.mapperId !== id) {
        // empty the collection if we are trying to load the maps
        // collection of a different mapper than we had previously
        DataModel.Maps.Mapper.reset()
        DataModel.Maps.Mapper.page = 1
      }
      DataModel.Maps.Mapper.mapperId = id
    }

    Views.ExploreMaps.setCollection(DataModel.Maps[capitalize])

    var navigate = function() {
      var path = '/explore/' + self.currentPage

      // alter url if for mapper profile page
      if (self.currentPage === 'mapper') {
        path += '/' + DataModel.Maps.Mapper.mapperId
      }

      self.navigateAndTrack(path)
    }
    var navigateTimeout = function() {
      self.timeoutId = setTimeout(navigate, 300)
    }
    if (DataModel.Maps[capitalize].length === 0) {
      Loading.show()
      Views.ExploreMaps.pending = true
      setTimeout(function() {
        DataModel.Maps[capitalize].getMaps(navigate) // this will trigger an explore maps render
      }, 300) // wait 300 milliseconds till the other animations are done to do the fetch
    } else {
      if (id) {
        Views.ExploreMaps.fetchUserThenRender(navigateTimeout)
      } else {
        Views.ExploreMaps.render(navigateTimeout)
      }
    }

    GlobalUI.showDiv('#explore')
    GlobalUI.hideDiv('#yield')
    GlobalUI.hideDiv('#infovis')
    GlobalUI.hideDiv('#instructions')
    Map.end()
    Topic.end()
    Active.Map = null
    Active.Topic = null
  },
  maps: function(id) {
    clearTimeout(this.timeoutId)

    this.currentSection = 'map'
    this.currentPage = id

    $('.wrapper').removeClass('homePage explorePage topicPage')
    $('.wrapper').addClass('mapPage')
    // another class will be added to wrapper if you
    // can edit this map '.canEditMap'

    GlobalUI.hideDiv('#yield')
    GlobalUI.hideDiv('#explore')

    // clear the visualization, if there was one, before showing its div again
    if (Visualize.mGraph) {
      Visualize.clearVisualization()
    }
    GlobalUI.showDiv('#infovis')
    Topic.end()
    Active.Topic = null

    Loading.show()
    Map.end()
    Map.launch(id)
  },
  topics: function(id) {
    clearTimeout(this.timeoutId)

    this.currentSection = 'topic'
    this.currentPage = id

    $('.wrapper').removeClass('homePage explorePage mapPage')
    $('.wrapper').addClass('topicPage')

    GlobalUI.hideDiv('#yield')
    GlobalUI.hideDiv('#explore')

    // clear the visualization, if there was one, before showing its div again
    if (Visualize.mGraph) {
      Visualize.clearVisualization()
    }
    GlobalUI.showDiv('#infovis')
    Map.end()
    Active.Map = null

    Topic.end()
    Topic.launch(id)
  }
})

const Router = new _Router()

Router.navigateAndTrack = (fragment, options) => {
  Router.navigate(fragment, options)
  window.ga && window.ga('send', 'pageview', location.pathname, {title: document.title})
}

Router.intercept = function(evt) {
  var segments

  var href = {
    prop: $(this).prop('href'),
    attr: $(this).attr('href')
  }
  var root = window.location.protocol + '//' + window.location.host + Backbone.history.options.root

  if (href.prop && href.prop === root) href.attr = ''

  if (href.prop && href.prop.slice(0, root.length) === root) {
    evt.preventDefault()

    segments = href.attr.split('/')
    segments.splice(0, 1) // pop off the element created by the first /

    if (href.attr === '') {
      Router.home()
    } else {
      Router[segments[0]](segments[1], segments[2])
    }
  }
}

Router.init = function() {
  Backbone.history.start({
    silent: true,
    pushState: true,
    root: '/'
  })
  $(document).on('click', 'a[data-router="true"]', Router.intercept)
}

export default Router

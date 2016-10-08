/* global Metamaps, $ */

import Active from '../Active'
import Create from '../Create'

import Search from './Search'
import CreateMap from './CreateMap'
import Account from './Account'
import ImportDialog from './ImportDialog'

/*
 * Metamaps.Backbone
 * Metamaps.Maps
 */

const GlobalUI = {
  notifyTimeout: null,
  lightbox: null,
  init: function () {
    var self = GlobalUI

    self.Search.init()
    self.CreateMap.init()
    self.Account.init()
    self.ImportDialog.init(Metamaps.Erb, self.openLightbox, self.closeLightbox)

    if ($('#toast').html().trim()) self.notifyUser($('#toast').html())

    // bind lightbox clicks
    $('.openLightbox').click(function (event) {
      self.openLightbox($(this).attr('data-open'))
      event.preventDefault()
      return false
    })

    $('#lightbox_screen, #lightbox_close').click(self.closeLightbox)

    // initialize global backbone models and collections
    if (Active.Mapper) Active.Mapper = new Metamaps.Backbone.Mapper(Active.Mapper)

    var myCollection = Metamaps.Maps.Mine ? Metamaps.Maps.Mine : []
    var sharedCollection = Metamaps.Maps.Shared ? Metamaps.Maps.Shared : []
    var starredCollection = Metamaps.Maps.Starred ? Metamaps.Maps.Starred : []
    var mapperCollection = []
    var mapperOptionsObj = { id: 'mapper', sortBy: 'updated_at' }
    if (Metamaps.Maps.Mapper) {
      mapperCollection = Metamaps.Maps.Mapper.models
      mapperOptionsObj.mapperId = Metamaps.Maps.Mapper.id
    }
    var featuredCollection = Metamaps.Maps.Featured ? Metamaps.Maps.Featured : []
    var activeCollection = Metamaps.Maps.Active ? Metamaps.Maps.Active : []
    Metamaps.Maps.Mine = new Metamaps.Backbone.MapsCollection(myCollection, { id: 'mine', sortBy: 'updated_at' })
    Metamaps.Maps.Shared = new Metamaps.Backbone.MapsCollection(sharedCollection, { id: 'shared', sortBy: 'updated_at' })
    Metamaps.Maps.Starred = new Metamaps.Backbone.MapsCollection(starredCollection, { id: 'starred', sortBy: 'updated_at' })
    // 'Mapper' refers to another mapper
    Metamaps.Maps.Mapper = new Metamaps.Backbone.MapsCollection(mapperCollection, mapperOptionsObj)
    Metamaps.Maps.Featured = new Metamaps.Backbone.MapsCollection(featuredCollection, { id: 'featured', sortBy: 'updated_at' })
    Metamaps.Maps.Active = new Metamaps.Backbone.MapsCollection(activeCollection, { id: 'active', sortBy: 'updated_at' })
  },
  showDiv: function (selector) {
    $(selector).show()
    $(selector).animate({
      opacity: 1
    }, 200, 'easeOutCubic')
  },
  hideDiv: function (selector) {
    $(selector).animate({
      opacity: 0
    }, 200, 'easeInCubic', function () { $(this).hide() })
  },
  openLightbox: function (which) {
    var self = GlobalUI

    $('.lightboxContent').hide()
    $('#' + which).show()

    self.lightbox = which

    $('#lightbox_overlay').show()

    var heightOfContent = '-' + ($('#lightbox_main').height() / 2) + 'px'
    // animate the content in from the bottom
    $('#lightbox_main').animate({
      'top': '50%',
      'margin-top': heightOfContent
    }, 200, 'easeOutCubic')

    // fade the black overlay in
    $('#lightbox_screen').animate({
      'opacity': '0.42'
    }, 200)

    if (which === 'switchMetacodes') {
      Create.isSwitchingSet = true
    }
  },

  closeLightbox: function (event) {
    var self = GlobalUI

    if (event) event.preventDefault()

    // animate the lightbox content offscreen
    $('#lightbox_main').animate({
      'top': '100%',
      'margin-top': '0'
    }, 200, 'easeInCubic')

    // fade the black overlay out
    $('#lightbox_screen').animate({
      'opacity': '0.0'
    }, 200, function () {
      $('#lightbox_overlay').hide()
    })

    if (self.lightbox === 'forkmap') GlobalUI.CreateMap.reset('fork_map')
    if (self.lightbox === 'newmap') GlobalUI.CreateMap.reset('new_map')
    if (Create && Create.isSwitchingSet) {
      Create.cancelMetacodeSetSwitch()
    }
    self.lightbox = null
  },
  notifyUser: function (message, leaveOpen) {
    var self = GlobalUI

    $('#toast').html(message)
    self.showDiv('#toast')
    clearTimeout(self.notifyTimeOut)
    if (!leaveOpen) {
      self.notifyTimeOut = setTimeout(function () {
        self.hideDiv('#toast')
      }, 8000)
    }
  },
  clearNotify: function () {
    var self = GlobalUI

    clearTimeout(self.notifyTimeOut)
    self.hideDiv('#toast')
  },
  shareInvite: function (inviteLink) {
    window.prompt('To copy the invite link, press: Ctrl+C, Enter', inviteLink)
  }
}

export { Search, CreateMap, Account, ImportDialog }
export default GlobalUI

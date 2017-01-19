/* global $ */

import clipboard from 'clipboard-js'

import Create from '../Create'

import Search from './Search'
import CreateMap from './CreateMap'
import Account from './Account'
import ImportDialog from './ImportDialog'
import NotificationIcon from './NotificationIcon'

const GlobalUI = {
  notifyTimeout: null,
  notifyQueue: [],
  notifying: false,
  lightbox: null,
  init: function(serverData) {
    const self = GlobalUI

    self.Search.init(serverData)
    self.CreateMap.init(serverData)
    self.Account.init(serverData)
    self.ImportDialog.init(serverData, self.openLightbox, self.closeLightbox)
    self.NotificationIcon.init(serverData)

    if ($('#toast').html().trim()) self.notifyUser($('#toast').html())

    // bind lightbox clicks
    $('.openLightbox').click(function(event) {
      self.openLightbox($(this).attr('data-open'))
      event.preventDefault()
      return false
    })

    $('#lightbox_screen, #lightbox_close').click(self.closeLightbox)
  },
  showDiv: function(selector) {
    $(selector).show()
    $(selector).animate({
      opacity: 1
    }, 200, 'easeOutCubic')
  },
  hideDiv: function(selector) {
    $(selector).animate({
      opacity: 0
    }, 200, 'easeInCubic', function() { $(this).hide() })
  },
  openLightbox: function(which) {
    const self = GlobalUI

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

  closeLightbox: function(event) {
    const self = GlobalUI

    if (event) event.preventDefault()

    // animate the lightbox content offscreen
    $('#lightbox_main').animate({
      'top': '100%',
      'margin-top': '0'
    }, 200, 'easeInCubic')

    // fade the black overlay out
    $('#lightbox_screen').animate({
      'opacity': '0.0'
    }, 200, function() {
      $('#lightbox_overlay').hide()
    })

    if (self.lightbox === 'forkmap') GlobalUI.CreateMap.reset('fork_map')
    if (self.lightbox === 'newmap') GlobalUI.CreateMap.reset('new_map')
    if (Create && Create.isSwitchingSet) {
      Create.cancelMetacodeSetSwitch()
    }
    self.lightbox = null
  },
  notifyUser: function(message, opts = {}) {
    const self = GlobalUI

    if (self.notifying) {
      self.notifyQueue.push({ message, opts })
      return
    } else {
      self._notifyUser(message, opts)
    }
  },
  // note: use the wrapper function notifyUser instead of this one
  _notifyUser: function(message, opts = {}) {
    const self = GlobalUI

    const { leaveOpen = false, timeOut = 8000 } = opts

    $('#toast').html(message)
    self.showDiv('#toast')
    clearTimeout(self.notifyTimeOut)

    if (!leaveOpen) {
      self.notifyTimeOut = setTimeout(function() {
        GlobalUI.clearNotify()
      }, timeOut)
    }

    self.notifying = true
  },
  clearNotify: function() {
    const self = GlobalUI

    // if there are messages remaining, display them
    if (self.notifyQueue.length > 0) {
      const { message, opts } = self.notifyQueue.shift()
      self._notifyUser(message, opts)
    } else {
      self.hideDiv('#toast')
      self.notifying = false
    }
  },
  shareInvite: function(inviteLink) {
    clipboard.copy({
      'text/plain': inviteLink
    }).then(() => {
      $('#joinCodesBox .popup').remove()
      $('#joinCodesBox').append('<p class="popup" style="text-align: center">Copied!</p>')
      window.setTimeout(() => $('#joinCodesBox .popup').remove(), 1500)
    }, () => {
      $('#joinCodesBox .popup').remove()
      $('#joinCodesBox').append(`<p class="popup" style="text-align: center">Your browser doesn't support copying, please copy manually.</p>`)
      window.setTimeout(() => $('#joinCodesBox .popup').remove(), 1500)
    })
  }
}

export { Search, CreateMap, Account, ImportDialog, NotificationIcon }
export default GlobalUI

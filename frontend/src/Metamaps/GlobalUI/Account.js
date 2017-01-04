/* global $ */

import Filter from '../Filter'

const Account = {
  isOpen: false,
  changing: false,
  init: function() {
    var self = Account

    $('.sidebarAccountIcon').click(self.toggleBox)
    $('.sidebarAccountBox').click(function(event) {
      event.stopPropagation()
    })
    $('body').click(self.close)
  },
  toggleBox: function(event) {
    var self = Account

    if (self.isOpen) self.close()
    else self.open()

    event.stopPropagation()
  },
  open: function() {
    var self = Account

    Filter.close()
    $('.sidebarAccountIcon .tooltipsUnder').addClass('hide')

    if (!self.isOpen && !self.changing) {
      self.changing = true
      $('.sidebarAccountBox').fadeIn(200, function() {
        self.changing = false
        self.isOpen = true
        $('.sidebarAccountBox #user_email').focus()
      })
    }
  },
  close: function() {
    var self = Account

    $('.sidebarAccountIcon .tooltipsUnder').removeClass('hide')
    if (!self.changing) {
      self.changing = true
      $('.sidebarAccountBox #user_email').blur()
      $('.sidebarAccountBox').fadeOut(200, function() {
        self.changing = false
        self.isOpen = false
      })
    }
  }
}

export default Account

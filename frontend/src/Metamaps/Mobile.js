/* global Metamaps, $ */

/*
 * Metamaps.Mobile.js
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.Map
 */

const Mobile = {
  init: function () {
    var self = Mobile
    
    $('#menu_icon').click(self.toggleMenu)
    $('#mobile_menu li a').click(self.liClick)
    $('#header_content').click(self.titleClick)
    self.resizeTitle()
  },
  resizeTitle: function () {
    // the 70 relates to padding
    $('#header_content').width($(document).width() - 70)
  },
  liClick: function () {
    var self = Mobile
    $('#header_content').html($(this).text())
    self.toggleMenu()
  },
  toggleMenu: function () {
    $('#mobile_menu').toggle()
  },
  titleClick: function () {
    if (Metamaps.Active.Map) {
      Metamaps.Map.InfoBox.open()
    }
  }
}

export default Mobile

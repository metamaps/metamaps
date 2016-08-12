/* global Metamaps, $ */

/*
 * Metamaps.Mobile.js
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.Map
 */

Metamaps.Mobile = {
  init: function () {
    var self = Metamaps.Mobile
    
    $('#menu_icon').click(self.toggleMenu)
    $('#mobile_menu li a').click(self.liClick)
    $('#header_content').click(self.titleClick)
  },
  liClick: function () {
    var self = Metamaps.Mobile
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

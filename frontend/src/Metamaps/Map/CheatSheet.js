/* global $ */

const CheatSheet = {
  init: function() {
    // tab the cheatsheet
    $('#cheatSheet').tabs()
    $('#quickReference').tabs().addClass('ui-tabs-vertical ui-helper-clearfix')
    $('#quickReference .ui-tabs-nav li').removeClass('ui-corner-top').addClass('ui-corner-left')
  }
}

export default CheatSheet

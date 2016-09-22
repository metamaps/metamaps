/* global $ */

const Admin = {
  selectMetacodes: [],
  allMetacodes: [],
  init: function () {
    var self = Metamaps.Admin

    $('#metacodes_value').val(self.selectMetacodes.toString())
  },
  selectAll: function () {
    var self = Metamaps.Admin

    $('.editMetacodes li').removeClass('toggledOff')
    self.selectMetacodes = self.allMetacodes.slice(0)
    $('#metacodes_value').val(self.selectMetacodes.toString())
  },
  deselectAll: function () {
    var self = Metamaps.Admin

    $('.editMetacodes li').addClass('toggledOff')
    self.selectMetacodes = []
    $('#metacodes_value').val(0)
  },
  liClickHandler: function () {
    var self = Metamaps.Admin

    if ($(this).attr('class') != 'toggledOff') {
      $(this).addClass('toggledOff')
      var value_to_remove = $(this).attr('id')
      self.selectMetacodes.splice(self.selectMetacodes.indexOf(value_to_remove), 1)
      $('#metacodes_value').val(self.selectMetacodes.toString())
    }
    else if ($(this).attr('class') == 'toggledOff') {
      $(this).removeClass('toggledOff')
      self.selectMetacodes.push($(this).attr('id'))
      $('#metacodes_value').val(self.selectMetacodes.toString())
    }
  },
  validate: function () {
    var self = Metamaps.Admin

    if (self.selectMetacodes.length == 0) {
      alert('Would you pretty please select at least one metacode for the set?')
      return false
    }
  }
}

export default Admin

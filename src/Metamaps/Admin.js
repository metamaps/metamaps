/* global $ */

const Admin = {
  selectMetacodes: [],
  allMetacodes: [],
  init: function() {
    var self = Admin

    $('#metacodes_value').val(self.selectMetacodes.toString())
  },
  selectAll: function() {
    var self = Admin

    $('.editMetacodes li').removeClass('toggledOff')
    self.selectMetacodes = self.allMetacodes.slice(0)
    $('#metacodes_value').val(self.selectMetacodes.toString())
  },
  deselectAll: function() {
    var self = Admin

    $('.editMetacodes li').addClass('toggledOff')
    self.selectMetacodes = []
    $('#metacodes_value').val(0)
  },
  liClickHandler: function() {
    var self = Admin

    if ($(this).attr('class') !== 'toggledOff') {
      $(this).addClass('toggledOff')
      const valueToRemove = $(this).attr('id')
      self.selectMetacodes.splice(self.selectMetacodes.indexOf(valueToRemove), 1)
      $('#metacodes_value').val(self.selectMetacodes.toString())
    } else if ($(this).attr('class') === 'toggledOff') {
      $(this).removeClass('toggledOff')
      self.selectMetacodes.push($(this).attr('id'))
      $('#metacodes_value').val(self.selectMetacodes.toString())
    }
  },
  validate: function() {
    var self = Admin

    if (self.selectMetacodes.length === 0) {
      window.alert('Would you pretty please select at least one metacode for the set?')
      return false
    }
  }
}

export default Admin

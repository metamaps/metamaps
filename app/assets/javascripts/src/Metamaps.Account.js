/* global Metamaps, $ */

/*
 * Metamaps.Account.js.erb
 *
 * Dependencies:
 *  - Metamaps.Erb
 */

Metamaps.Account = {
  listenersInitialized: false,
  init: function () {
    var self = Metamaps.Account
  },
  initListeners: function () {
    var self = Metamaps.Account

    $('#user_image').change(self.showImagePreview)
    self.listenersInitialized = true
  },
  toggleChangePicture: function () {
    var self = Metamaps.Account

    $('.userImageMenu').toggle()
    if (!self.listenersInitialized) self.initListeners()
  },
  openChangePicture: function () {
    var self = Metamaps.Account

    $('.userImageMenu').show()
    if (!self.listenersInitialized) self.initListeners()
  },
  closeChangePicture: function () {
    var self = Metamaps.Account

    $('.userImageMenu').hide()
  },
  showLoading: function () {
    var self = Metamaps.Account

    var loader = new CanvasLoader('accountPageLoading')
    loader.setColor('#4FC059'); // default is '#000000'
    loader.setDiameter(28) // default is 40
    loader.setDensity(41) // default is 40
    loader.setRange(0.9); // default is 1.3
    loader.show() // Hidden by default
    $('#accountPageLoading').show()
  },
  showImagePreview: function () {
    var self = Metamaps.Account

    var file = $('#user_image')[0].files[0]

    var reader = new FileReader()

    reader.onload = function (e) {
      var $canvas = $('<canvas>').attr({
        width: 84,
        height: 84
      })
      var context = $canvas[0].getContext('2d')
      var imageObj = new Image()

      imageObj.onload = function () {
        $('.userImageDiv canvas').remove()
        $('.userImageDiv img').hide()

        var imgWidth = imageObj.width
        var imgHeight = imageObj.height

        var dimensionToMatch = imgWidth > imgHeight ? imgHeight : imgWidth
        // draw cropped image
        var nonZero = Math.abs(imgHeight - imgWidth) / 2
        var sourceX = dimensionToMatch === imgWidth ? 0 : nonZero
        var sourceY = dimensionToMatch === imgHeight ? 0 : nonZero
        var sourceWidth = dimensionToMatch
        var sourceHeight = dimensionToMatch
        var destX = 0
        var destY = 0
        var destWidth = 84
        var destHeight = 84

        context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)
        $('.userImageDiv').prepend($canvas)
      }
      imageObj.src = reader.result
    }

    if (file) {
      reader.readAsDataURL(file)
      $('.userImageMenu').hide()
      $('#remove_image').val('0')
    }
  },
  removePicture: function () {
    var self = Metamaps.Account

    $('.userImageDiv canvas').remove()
    $('.userImageDiv img').attr('src', Metamaps.Erb['user.png']).show()
    $('.userImageMenu').hide()

    var input = $('#user_image')
    input.replaceWith(input.val('').clone(true))
    $('#remove_image').val('1')
  },
  changeName: function () {
    $('.accountName').hide()
    $('.changeName').show()
  },
  showPass: function () {
    $('.toHide').show()
    $('.changePass').hide()
  },
  hidePass: function () {
    $('.toHide').hide()
    $('.changePass').show()

    $('#current_password').val('')
    $('#user_password').val('')
    $('#user_password_confirmation').val('')
  }
}

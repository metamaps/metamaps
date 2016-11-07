/* global $ */

import outdent from 'outdent'

import Active from '../Active'
import DataModel from '../DataModel'
import DataModelMap from '../DataModel/Map'
import GlobalUI from './index'

const CreateMap = {
  newMap: null,
  emptyMapForm: '',
  emptyForkMapForm: '',
  topicsToMap: [],
  synapsesToMap: [],
  init: function() {
    var self = CreateMap

    self.newMap = new DataModelMap({ permission: 'commons' })

    self.bindFormEvents()

    self.emptyMapForm = $('#new_map').html()
  },
  bindFormEvents: function() {
    var self = CreateMap

    $('.new_map input, .new_map div').unbind('keypress').bind('keypress', function(event) {
      if (event.keyCode === 13) self.submit()
    })

    $('.new_map button.cancel').unbind().bind('click', function(event) {
      event.preventDefault()
      GlobalUI.closeLightbox()
    })
    $('.new_map button.submitMap').unbind().bind('click', self.submit)

    // bind permission changer events on the createMap form
    $('.permIcon').unbind().bind('click', self.switchPermission)
  },
  closeSuccess: function() {
    $('#mapCreatedSuccess').fadeOut(300, function() {
      $(this).remove()
    })
  },
  switchPermission: function() {
    var self = CreateMap

    self.newMap.set('permission', $(this).attr('data-permission'))
    $(this).siblings('.permIcon').find('.mapPermIcon').removeClass('selected')
    $(this).find('.mapPermIcon').addClass('selected')

    var permText = $(this).find('.tip').html()
    $(this).parents('.new_map').find('.permText').html(permText)
  },
  submit: function(event) {
    if (event) event.preventDefault()

    var self = CreateMap

    if (GlobalUI.lightbox === 'forkmap') {
      self.newMap.set('topicsToMap', self.topicsToMap)
      self.newMap.set('synapsesToMap', self.synapsesToMap)
    }

    var formId = GlobalUI.lightbox === 'forkmap' ? '#fork_map' : '#new_map'
    var $form = $(formId)

    self.newMap.set('name', $form.find('#map_name').val())
    self.newMap.set('desc', $form.find('#map_desc').val())

    if (self.newMap.get('name').length === 0) {
      self.throwMapNameError()
      return
    }

    self.newMap.save(null, {
      success: self.success
    // TODO add error message
    })

    GlobalUI.closeLightbox()
    GlobalUI.notifyUser('Working...')
  },
  throwMapNameError: function() {
    var formId = GlobalUI.lightbox === 'forkmap' ? '#fork_map' : '#new_map'
    var $form = $(formId)

    var message = $("<div class='feedback_message'>Please enter a map name...</div>")

    $form.find('#map_name').after(message)
    setTimeout(function() {
      message.fadeOut('fast', function() {
        message.remove()
      })
    }, 5000)
  },
  success: function(model) {
    // push the new map onto the collection of 'my maps'
    DataModel.Maps.Mine.add(model)

    GlobalUI.clearNotify()
    $('#wrapper').append(outdent`
      <div id="mapCreatedSuccess">
        <h6>SUCCESS!</h6>
        Your map has been created. Do you want to:
        <a id="mapGo" href="/maps/${model.id}">Go to your new map</a>
        <span>OR</span>
        <a id="mapStay" href="#">Stay on this ${Active.Map ? 'map' : 'page'}</a>
      </div>
    `)
    $('#mapGo').click(e => GlobalUI.CreateMap.closeSuccess())
    $('#mapStay').click(e => {
      GlobalUI.CreateMap.closeSuccess()
      return false
    })
  },
  reset: function(id) {
    var self = CreateMap

    var form = $('#' + id)

    if (id === 'fork_map') {
      self.topicsToMap = []
      self.synapsesToMap = []
      form.html(self.emptyForkMapForm)
    } else {
      form.html(self.emptyMapForm)
    }

    self.bindFormEvents()
    self.newMap = new DataModel.Map({ permission: 'commons' })

    return false
  }
}

export default CreateMap

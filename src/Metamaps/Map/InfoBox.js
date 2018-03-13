/* global $, Hogan, Bloodhound, Countable */

import outdent from 'outdent'
import { browserHistory } from 'react-router'

import Active from '../Active'
import DataModel from '../DataModel'
import GlobalUI, { ReactApp } from '../GlobalUI'
import Util from '../Util'

const InfoBox = {
  isOpen: false,
  selectingPermission: false,
  init: function(serverData, updateThumbnail) {
    var self = InfoBox

    self.updateThumbnail = updateThumbnail

    $('body').click(self.close)

    var querystring = window.location.search.replace(/^\?/, '')
    if (querystring === 'new') {
      self.open()
      $('.mapInfoBox').addClass('mapRequestTitle')
      $('#mapInfoName').trigger('click')
      $('#mapInfoName textarea').focus()
      $('#mapInfoName textarea').select()
    }
  },
  toggleBox: function(event) {
    var self = InfoBox

    if (self.isOpen) self.close()
    else self.open()

    event.stopPropagation()
  },
  open: function() {
    var self = InfoBox
    $('.mapInfoIcon div').addClass('hide')
    $('.mapInfoBox').fadeIn(200, function() {
      self.isOpen = true
    })
  },
  close: function() {
    var self = InfoBox
    $('.mapInfoIcon div').removeClass('hide')
    $('.mapInfoBox').fadeOut(200, function() {
      self.isOpen = false
      self.hidePermissionSelect()
      $('.mapContributors .tip').hide()
    })
  },
  load: function() {
    InfoBox.attachEventListeners()
  },
  attachEventListeners: function() {
    var self = InfoBox
    $('.mapInfoBox').click(function(event) {
      event.stopPropagation()
    })
    $('.mapInfoBox.canEdit .best_in_place').best_in_place()

    // because anyone who can edit the map can change the map title
    var bipName = $('.mapInfoBox .best_in_place_name')
    bipName.unbind('best_in_place:activate').bind('best_in_place:activate', function() {
      var $el = bipName.find('textarea')
      var el = $el[0]

      $el.attr('maxlength', '140')

      $('.mapInfoName').append('<div class="nameCounter forMap"></div>')

      var callback = function(data) {
        $('.nameCounter.forMap').html(data.all + '/140')
      }
      Countable.live(el, callback)
    })
    bipName.unbind('best_in_place:deactivate').bind('best_in_place:deactivate', function() {
      $('.nameCounter.forMap').remove()
    })

    $('.mapInfoName .best_in_place_name').unbind('ajax:success').bind('ajax:success', function() {
      var name = $(this).html()
      Active.Map.set('name', name)
      Active.Map.trigger('saved')
      // mobile menu
      $('#header_content').html(name)
      $('.mapInfoBox').removeClass('mapRequestTitle')
      document.title = `${name} | Metamaps`
      window.history.replaceState('', `${name} | Metamaps`, window.location.pathname)
    })

    $('.mapInfoDesc .best_in_place_desc').unbind('ajax:success').bind('ajax:success', function() {
      var desc = $(this).html()
      Active.Map.set('desc', desc)
      Active.Map.trigger('saved')
    })

    $('.mapInfoDesc .best_in_place_desc, .mapInfoName .best_in_place_name').unbind('keypress').keypress(function(e) {
      const ENTER = 13
      if (e.which === ENTER) {
        $(this).data('bestInPlaceEditor').update()
      }
    })

    $('.yourMap .mapPermission').unbind().click(self.onPermissionClick)
    // .yourMap in the unbind/bind is just a namespace for the events
    // not a reference to the class .yourMap on the .mapInfoBox
    $('.mapInfoBox.yourMap').unbind('.yourMap').bind('click.yourMap', self.hidePermissionSelect)

    $('.yourMap .mapInfoDelete').unbind().click(self.deleteActiveMap)
    $('.mapInfoThumbnail').unbind().click(self.updateThumbnail)

    $('.mapContributors span, #mapContribs').unbind().click(function(event) {
      $('.mapContributors .tip').toggle()
      event.stopPropagation()
    })
    $('.mapContributors .tip').unbind().click(function(event) {
      event.stopPropagation()
    })

    $('.mapInfoBox').unbind('.hideTip').bind('click.hideTip', function() {
      $('.mapContributors .tip').hide()
    })

    self.addTypeahead()
  },
  addTypeahead: function() {
    var self = InfoBox

    if (!Active.Map) return

    // for autocomplete
    var collaborators = {
      name: 'collaborators',
      limit: 9999,
      display: function(s) { return s.label },
      templates: {
        notFound: function(s) {
          return Hogan.compile($('#collaboratorSearchTemplate').html()).render({
            value: 'No results',
            label: 'No results',
            rtype: 'noresult',
            profile: self.userImageUrl
          })
        },
        suggestion: function(s) {
          return Hogan.compile($('#collaboratorSearchTemplate').html()).render(s)
        }
      },
      source: new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/search/mappers?term=%QUERY',
          wildcard: '%QUERY'
        }
      })
    }

    // for adding map collaborators, who will have edit rights
    if (Active.Mapper && Active.Mapper.id === Active.Map.get('user_id')) {
      $('.collaboratorSearchField').typeahead(
        {
          highlight: false
        },
        [collaborators]
      )
      $('.collaboratorSearchField').bind('typeahead:select', self.handleResultClick)
      $('.mapContributors .removeCollaborator').click(function() {
        self.removeCollaborator(parseInt($(this).data('id')))
      })
    }
  },
  removeCollaborator: function(collaboratorId) {
    var self = InfoBox
    DataModel.Collaborators.remove(DataModel.Collaborators.get(collaboratorId))
    var mapperIds = DataModel.Collaborators.models.map(function(mapper) { return mapper.id })
    $.post('/maps/' + Active.Map.id + '/access', { access: mapperIds })
  },
  addCollaborator: function(newCollaboratorId) {
    var self = InfoBox

    if (DataModel.Collaborators.get(newCollaboratorId)) {
      GlobalUI.notifyUser('That user already has access')
      return
    }

    function callback(mapper) {
      DataModel.Collaborators.add(mapper)
      var mapperIds = DataModel.Collaborators.models.map(function(mapper) { return mapper.id })
      $.post('/maps/' + Active.Map.id + '/access', { access: mapperIds })
      var name = DataModel.Collaborators.get(newCollaboratorId).get('name')
      GlobalUI.notifyUser(name + ' will be notified')
    }

    $.getJSON('/users/' + newCollaboratorId + '.json', callback)
  },
  handleResultClick: function(event, item) {
    var self = InfoBox

    self.addCollaborator(item.id)
    $('.collaboratorSearchField').typeahead('val', '')
  },
  updateNameDescPerm: function(name, desc, perm) {
    $('.mapInfoBox').removeClass('mapRequestTitle')
    $('.mapInfoName .best_in_place_name').html(name)
    $('.mapInfoDesc .best_in_place_desc').html(desc)
    $('.mapInfoBox .mapPermission').removeClass('commons public private').addClass(perm)
  },
  onPermissionClick: function(event) {
    var self = InfoBox

    if (!self.selectingPermission) {
      self.selectingPermission = true
      $(this).addClass('minimize') // this line flips the drop down arrow to a pull up arrow
      if ($(this).hasClass('commons')) {
        $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>')
      } else if ($(this).hasClass('public')) {
        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>')
      } else if ($(this).hasClass('private')) {
        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>')
      }
      $('.mapPermission .permissionSelect li').click(self.selectPermission)
      event.stopPropagation()
    }
  },
  hidePermissionSelect: function() {
    var self = InfoBox

    self.selectingPermission = false
    $('.mapPermission').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
    $('.mapPermission .permissionSelect').remove()
  },
  selectPermission: function(event) {
    var self = InfoBox

    self.selectingPermission = false
    var permission = $(this).attr('class')
    Active.Map.save({
      permission: permission
    })
    Active.Map.updateMapWrapper()
    const shareable = permission === 'private' ? '' : 'shareable'
    $('.mapPermission').removeClass('commons public private minimize').addClass(permission)
    $('.mapPermission .permissionSelect').remove()
    $('.mapInfoBox').removeClass('shareable').addClass(shareable)
    event.stopPropagation()
  },
  deleteActiveMap: function() {
    var confirmString = 'Are you sure you want to delete this map? '
    confirmString += 'This action is irreversible. It will not delete the topics and synapses on the map.'

    var doIt = window.confirm(confirmString)
    var map = Active.Map
    var mapper = Active.Mapper
    var authorized = map.authorizePermissionChange(mapper)

    if (doIt && authorized) {
      InfoBox.close()
      DataModel.Maps.Active.remove(map)
      DataModel.Maps.Featured.remove(map)
      DataModel.Maps.Mine.remove(map)
      DataModel.Maps.Shared.remove(map)
      map.destroy()
      browserHistory.push('/')
      GlobalUI.notifyUser('Map eliminated')
    } else if (!authorized) {
      window.alert("Hey now. We can't just go around willy nilly deleting other people's maps now can we? Run off and find something constructive to do, eh?")
    }
  }
}

export default InfoBox

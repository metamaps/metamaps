/* global Metamaps, $, Hogan, Bloodhound, Countable */

import Active from '../Active'
import GlobalUI from '../GlobalUI'
import Router from '../Router'
import Util from '../Util'

/*
 * Metamaps.Collaborators
 * Metamaps.Erb
 * Metamaps.Mappers
 * Metamaps.Maps
 * Metamaps.Synapses
 * Metamaps.Topics
 */

const InfoBox = {
  isOpen: false,
  changing: false,
  selectingPermission: false,
  changePermissionText: "<div class='tooltips'>As the creator, you can change the permission of this map, and the permission of all the topics and synapses you have authority to change will change as well.</div>",
  nameHTML: '<span class="best_in_place best_in_place_name" id="best_in_place_map_{{id}}_name" data-url="/maps/{{id}}" data-object="map" data-attribute="name" data-type="textarea" data-activator="#mapInfoName">{{name}}</span>',
  descHTML: '<span class="best_in_place best_in_place_desc" id="best_in_place_map_{{id}}_desc" data-url="/maps/{{id}}" data-object="map" data-attribute="desc" data-nil="Click to add description..." data-type="textarea" data-activator="#mapInfoDesc">{{desc}}</span>',
  init: function () {
    var self = InfoBox

    $('.mapInfoIcon').click(self.toggleBox)
    $('.mapInfoBox').click(function (event) {
      event.stopPropagation()
    })
    $('body').click(self.close)

    self.attachEventListeners() 

    self.generateBoxHTML = Hogan.compile($('#mapInfoBoxTemplate').html())
    
    var querystring = window.location.search.replace(/^\?/, '')
    if (querystring == 'new') { 
      self.open()
      $('.mapInfoBox').addClass('mapRequestTitle')
      $('#mapInfoName').trigger('click')
      $('#mapInfoName textarea').focus()
      $('#mapInfoName textarea').select()
    }
  },
  toggleBox: function (event) {
    var self = InfoBox

    if (self.isOpen) self.close()
    else self.open()

    event.stopPropagation()
  },
  open: function () {
    var self = InfoBox
    $('.mapInfoIcon div').addClass('hide')
    if (!self.isOpen && !self.changing) {
      self.changing = true
      $('.mapInfoBox').fadeIn(200, function () {
        self.changing = false
        self.isOpen = true
      })
    }
  },
  close: function () {
    var self = InfoBox

    $('.mapInfoIcon div').removeClass('hide')
    if (!self.changing) {
      self.changing = true
      $('.mapInfoBox').fadeOut(200, function () {
        self.changing = false
        self.isOpen = false
        self.hidePermissionSelect()
        $('.mapContributors .tip').hide()
      })
    }
  },
  load: function () {
    var self = InfoBox

    var map = Active.Map

    var obj = map.pick('permission', 'topic_count', 'synapse_count')

    var isCreator = map.authorizePermissionChange(Active.Mapper)
    var canEdit = map.authorizeToEdit(Active.Mapper)
    var relevantPeople = map.get('permission') === 'commons' ? Metamaps.Mappers : Metamaps.Collaborators
    var shareable = map.get('permission') !== 'private'

    obj['name'] = canEdit ? Hogan.compile(self.nameHTML).render({id: map.id, name: map.get('name')}) : map.get('name')
    obj['desc'] = canEdit ? Hogan.compile(self.descHTML).render({id: map.id, desc: map.get('desc')}) : map.get('desc')
    obj['map_creator_tip'] = isCreator ? self.changePermissionText : ''

    obj['contributor_count'] = relevantPeople.length
    obj['contributors_class'] = relevantPeople.length > 1 ? 'multiple' : ''
    obj['contributors_class'] += relevantPeople.length === 2 ? ' mTwo' : ''
    obj['contributor_image'] = relevantPeople.length > 0 ? relevantPeople.models[0].get('image') : Metamaps.Erb['user.png']
    obj['contributor_list'] = self.createContributorList()

    obj['user_name'] = isCreator ? 'You' : map.get('user_name')
    obj['created_at'] = map.get('created_at_clean')
    obj['updated_at'] = map.get('updated_at_clean')

    var classes = isCreator ? 'yourMap' : ''
    classes += canEdit ? ' canEdit' : ''
    classes += shareable ? ' shareable' : ''
    $('.mapInfoBox').removeClass('shareable yourMap canEdit')
      .addClass(classes)
      .html(self.generateBoxHTML.render(obj))

    self.attachEventListeners()
  },
  attachEventListeners: function () {
    var self = InfoBox

    $('.mapInfoBox.canEdit .best_in_place').best_in_place()

    // because anyone who can edit the map can change the map title
    var bipName = $('.mapInfoBox .best_in_place_name')
    bipName.unbind('best_in_place:activate').bind('best_in_place:activate', function () {
      var $el = bipName.find('textarea')
      var el = $el[0]

      $el.attr('maxlength', '140')

      $('.mapInfoName').append('<div class="nameCounter forMap"></div>')

      var callback = function (data) {
        $('.nameCounter.forMap').html(data.all + '/140')
      }
      Countable.live(el, callback)
    })
    bipName.unbind('best_in_place:deactivate').bind('best_in_place:deactivate', function () {
      $('.nameCounter.forMap').remove()
    })

    $('.mapInfoName .best_in_place_name').unbind('ajax:success').bind('ajax:success', function () {
      var name = $(this).html()
      Active.Map.set('name', name)
      Active.Map.trigger('saved')
      // mobile menu
      $('#header_content').html(name)
      $('.mapInfoBox').removeClass('mapRequestTitle')
      document.title = `${name} | Metamaps`
      window.history.replaceState('', `${name} | Metamaps`, window.location.pathname)
    })

    $('.mapInfoDesc .best_in_place_desc').unbind('ajax:success').bind('ajax:success', function () {
      var desc = $(this).html()
      Active.Map.set('desc', desc)
      Active.Map.trigger('saved')
    })

    $('.yourMap .mapPermission').unbind().click(self.onPermissionClick)
    // .yourMap in the unbind/bind is just a namespace for the events
    // not a reference to the class .yourMap on the .mapInfoBox
    $('.mapInfoBox.yourMap').unbind('.yourMap').bind('click.yourMap', self.hidePermissionSelect)

    $('.yourMap .mapInfoDelete').unbind().click(self.deleteActiveMap)

    $('.mapContributors span, #mapContribs').unbind().click(function (event) {
      $('.mapContributors .tip').toggle()
      event.stopPropagation()
    })
    $('.mapContributors .tip').unbind().click(function (event) {
      event.stopPropagation()
    })
    $('.mapContributors .tip li a').click(Router.intercept)

    $('.mapInfoBox').unbind('.hideTip').bind('click.hideTip', function () {
      $('.mapContributors .tip').hide()
    })

    self.addTypeahead() 
  },
  addTypeahead: function () {
    var self = InfoBox

    if (!Active.Map) return

    // for autocomplete
    var collaborators = {
        name: 'collaborators',
        limit: 9999,
        display: function(s) { return s.label; },
        templates: {
            notFound: function(s) {
                return Hogan.compile($('#collaboratorSearchTemplate').html()).render({
                    value: "No results",
                    label: "No results",
                    rtype: "noresult",
                    profile: Metamaps.Erb['user.png'],
                });
            },
            suggestion: function(s) {
                return Hogan.compile($('#collaboratorSearchTemplate').html()).render(s);
            },
        },
        source: new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: '/search/mappers?term=%QUERY',
                wildcard: '%QUERY',
            },
        })
    }

    // for adding map collaborators, who will have edit rights
    if (Active.Mapper && Active.Mapper.id === Active.Map.get('user_id')) {
      $('.collaboratorSearchField').typeahead(
        {
          highlight: false,
        },
        [collaborators]
      )
      $('.collaboratorSearchField').bind('typeahead:select', self.handleResultClick)
      $('.mapContributors .removeCollaborator').click(function () {
        self.removeCollaborator(parseInt($(this).data('id')))
      })
    } 
  },
  removeCollaborator: function (collaboratorId) {
    var self = InfoBox
    Metamaps.Collaborators.remove(Metamaps.Collaborators.get(collaboratorId))
    var mapperIds = Metamaps.Collaborators.models.map(function (mapper) { return mapper.id })
    $.post('/maps/' + Active.Map.id + '/access', { access: mapperIds })
    self.updateNumbers()
  },
  addCollaborator: function (newCollaboratorId) {
    var self = InfoBox

    if (Metamaps.Collaborators.get(newCollaboratorId)) {
      GlobalUI.notifyUser('That user already has access')
      return
    }

    function callback(mapper) {
      Metamaps.Collaborators.add(mapper)
      var mapperIds = Metamaps.Collaborators.models.map(function (mapper) { return mapper.id })
      $.post('/maps/' + Active.Map.id + '/access', { access: mapperIds })
      var name = Metamaps.Collaborators.get(newCollaboratorId).get('name')
      GlobalUI.notifyUser(name + ' will be notified by email')
      self.updateNumbers()
    }

    $.getJSON('/users/' + newCollaboratorId + '.json', callback)
  },
  handleResultClick: function (event, item) {
    var self = InfoBox

   self.addCollaborator(item.id)
   $('.collaboratorSearchField').typeahead('val', '')
  },
  updateNameDescPerm: function (name, desc, perm) {
    $('.mapInfoBox').removeClass('mapRequestTitle')
    $('.mapInfoName .best_in_place_name').html(name)
    $('.mapInfoDesc .best_in_place_desc').html(desc)
    $('.mapInfoBox .mapPermission').removeClass('commons public private').addClass(perm)
  },
  createContributorList: function () {
    var self = InfoBox
    var relevantPeople = Active.Map.get('permission') === 'commons' ? Metamaps.Mappers : Metamaps.Collaborators
    var activeMapperIsCreator = Active.Mapper && Active.Mapper.id === Active.Map.get('user_id')
    var string = ''
    string += '<ul>'

    relevantPeople.each(function (m) {
      var isCreator = Active.Map.get('user_id') === m.get('id')
      string += '<li><a href="/explore/mapper/' + m.get('id') + '">' + '<img class="rtUserImage" width="25" height="25" src="' + m.get('image') + '" />' + m.get('name')
      if (isCreator) string += ' (creator)' 
      string += '</a>'
      if (activeMapperIsCreator && !isCreator) string += '<span class="removeCollaborator" data-id="' + m.get('id') + '"></span>'
      string += '</li>'
    })

    string += '</ul>'

    if (activeMapperIsCreator) {
      string += '<div class="collabSearchField"><span class="addCollab"></span><input class="collaboratorSearchField" placeholder="Add a collaborator!"></input></div>'
    }
    return string
  },
  updateNumbers: function () {
    if (!Active.Map) return

    var self = InfoBox
    var mapper = Active.Mapper
    var relevantPeople = Active.Map.get('permission') === 'commons' ? Metamaps.Mappers : Metamaps.Collaborators

    var contributors_class = ''
    if (relevantPeople.length === 2) contributors_class = 'multiple mTwo'
    else if (relevantPeople.length > 2) contributors_class = 'multiple'

    var contributors_image = Metamaps.Erb['user.png']
    if (relevantPeople.length > 0) {
      // get the first contributor and use their image
      contributors_image = relevantPeople.models[0].get('image')
    }
    $('.mapContributors img').attr('src', contributors_image).removeClass('multiple mTwo').addClass(contributors_class)
    $('.mapContributors span').text(relevantPeople.length)
    $('.mapContributors .tip').html(self.createContributorList())
    self.addTypeahead()
    $('.mapContributors .tip').unbind().click(function (event) {
      event.stopPropagation()
    })
    $('.mapTopics').text(Metamaps.Topics.length)
    $('.mapSynapses').text(Metamaps.Synapses.length)

    $('.mapEditedAt').html('<span>Last edited: </span>' + Util.nowDateFormatted())
  },
  onPermissionClick: function (event) {
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
  hidePermissionSelect: function () {
    var self = InfoBox

    self.selectingPermission = false
    $('.mapPermission').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
    $('.mapPermission .permissionSelect').remove()
  },
  selectPermission: function (event) {
    var self = InfoBox

    self.selectingPermission = false
    var permission = $(this).attr('class')
    Active.Map.save({
      permission: permission
    })
    Active.Map.updateMapWrapper()
    shareable = permission === 'private' ? '' : 'shareable'
    $('.mapPermission').removeClass('commons public private minimize').addClass(permission)
    $('.mapPermission .permissionSelect').remove()
    $('.mapInfoBox').removeClass('shareable').addClass(shareable)
    event.stopPropagation()
  },
  deleteActiveMap: function () {
    var confirmString = 'Are you sure you want to delete this map? '
    confirmString += 'This action is irreversible. It will not delete the topics and synapses on the map.'

    var doIt = window.confirm(confirmString)
    var map = Active.Map
    var mapper = Active.Mapper
    var authorized = map.authorizePermissionChange(mapper)

    if (doIt && authorized) {
      InfoBox.close()
      Metamaps.Maps.Active.remove(map)
      Metamaps.Maps.Featured.remove(map)
      Metamaps.Maps.Mine.remove(map)
      Metamaps.Maps.Shared.remove(map)
      map.destroy()
      Router.home()
      GlobalUI.notifyUser('Map eliminated!')
    }
    else if (!authorized) {
      alert("Hey now. We can't just go around willy nilly deleting other people's maps now can we? Run off and find something constructive to do, eh?")
    }
  }
}

export default InfoBox

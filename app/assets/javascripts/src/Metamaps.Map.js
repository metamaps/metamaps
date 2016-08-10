/* global Metamaps, $ */

/*
 * Metamaps.Map.js.erb
 *
 * Dependencies:
 *  - Metamaps.Create
 *  - Metamaps.Erb
 *  - Metamaps.Filter
 *  - Metamaps.JIT
 *  - Metamaps.Loading
 *  - Metamaps.Maps
 *  - Metamaps.Realtime
 *  - Metamaps.Router
 *  - Metamaps.Selected
 *  - Metamaps.SynapseCard
 *  - Metamaps.TopicCard
 *  - Metamaps.Visualize
 *  - Metamaps.Active
 *  - Metamaps.Backbone
 *  - Metamaps.GlobalUI
 *  - Metamaps.Mappers
 *  - Metamaps.Mappings
 *  - Metamaps.Messages
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 *
 * Major sub-modules:
 *  - Metamaps.Map.CheatSheet
 *  - Metamaps.Map.InfoBox
 */

Metamaps.Map = {
  events: {
    editedByActiveMapper: 'Metamaps:Map:events:editedByActiveMapper'
  },
  nextX: 0,
  nextY: 0,
  sideLength: 1,
  turnCount: 0,
  nextXshift: 1,
  nextYshift: 0,
  timeToTurn: 0,
  init: function () {
    var self = Metamaps.Map

    // prevent right clicks on the main canvas, so as to not get in the way of our right clicks
    $('#center-container').bind('contextmenu', function (e) {
      return false
    })

    $('.sidebarFork').click(function () {
      self.fork()
    })

    Metamaps.GlobalUI.CreateMap.emptyForkMapForm = $('#fork_map').html()

    self.InfoBox.init()
    self.CheatSheet.init()

    $(document).on(Metamaps.Map.events.editedByActiveMapper, self.editedByActiveMapper)
  },
  launch: function (id) {
    var bb = Metamaps.Backbone
    var start = function (data) {
      Metamaps.Active.Map = new bb.Map(data.map)
      Metamaps.Mappers = new bb.MapperCollection(data.mappers)
      Metamaps.Collaborators = new bb.MapperCollection(data.collaborators)
      Metamaps.Topics = new bb.TopicCollection(data.topics)
      Metamaps.Synapses = new bb.SynapseCollection(data.synapses)
      Metamaps.Mappings = new bb.MappingCollection(data.mappings)
      Metamaps.Messages = data.messages
      Metamaps.Backbone.attachCollectionEvents()

      var map = Metamaps.Active.Map
      var mapper = Metamaps.Active.Mapper

      // add class to .wrapper for specifying whether you can edit the map
      if (map.authorizeToEdit(mapper)) {
        $('.wrapper').addClass('canEditMap')
      }

      // add class to .wrapper for specifying if the map can
      // be collaborated on
      if (map.get('permission') === 'commons') {
        $('.wrapper').addClass('commonsMap')
      }

      // set filter mapper H3 text
      $('#filter_by_mapper h3').html('MAPPERS')

      // build and render the visualization
      Metamaps.Visualize.type = 'ForceDirected'
      Metamaps.JIT.prepareVizData()

      // update filters
      Metamaps.Filter.reset()

      // reset selected arrays
      Metamaps.Selected.reset()

      // set the proper mapinfobox content
      Metamaps.Map.InfoBox.load()

      // these three update the actual filter box with the right list items
      Metamaps.Filter.checkMetacodes()
      Metamaps.Filter.checkSynapses()
      Metamaps.Filter.checkMappers()

      Metamaps.Realtime.startActiveMap()
      Metamaps.Loading.hide()
    }

    $.ajax({
      url: '/maps/' + id + '/contains.json',
      success: start
    })
  },
  end: function () {
    if (Metamaps.Active.Map) {
      $('.wrapper').removeClass('canEditMap commonsMap')
      Metamaps.Map.resetSpiral()

      $('.rightclickmenu').remove()
      Metamaps.TopicCard.hideCard()
      Metamaps.SynapseCard.hideCard()
      Metamaps.Create.newTopic.hide()
      Metamaps.Create.newSynapse.hide()
      Metamaps.Filter.close()
      Metamaps.Map.InfoBox.close()
      Metamaps.Realtime.endActiveMap()
    }
  },
  fork: function () {
    Metamaps.GlobalUI.openLightbox('forkmap')

    var nodes_data = '',
      synapses_data = ''
    var nodes_array = []
    var synapses_array = []
    // collect the unfiltered topics
    Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
      // if the opacity is less than 1 then it's filtered
      if (n.getData('alpha') === 1) {
        var id = n.getData('topic').id
        nodes_array.push(id)
        var x, y
        if (n.pos.x && n.pos.y) {
          x = n.pos.x
          y = n.pos.y
        } else {
          var x = Math.cos(n.pos.theta) * n.pos.rho
          var y = Math.sin(n.pos.theta) * n.pos.rho
        }
        nodes_data += id + '/' + x + '/' + y + ','
      }
    })
    // collect the unfiltered synapses
    Metamaps.Synapses.each(function (synapse) {
      var desc = synapse.get('desc')

      var descNotFiltered = Metamaps.Filter.visible.synapses.indexOf(desc) > -1
      // make sure that both topics are being added, otherwise, it
      // doesn't make sense to add the synapse
      var topicsNotFiltered = nodes_array.indexOf(synapse.get('node1_id')) > -1
      topicsNotFiltered = topicsNotFiltered && nodes_array.indexOf(synapse.get('node2_id')) > -1
      if (descNotFiltered && topicsNotFiltered) {
        synapses_array.push(synapse.id)
      }
    })

    synapses_data = synapses_array.join()
    nodes_data = nodes_data.slice(0, -1)

    Metamaps.GlobalUI.CreateMap.topicsToMap = nodes_data
    Metamaps.GlobalUI.CreateMap.synapsesToMap = synapses_data
  },
  leavePrivateMap: function () {
    var map = Metamaps.Active.Map
    Metamaps.Maps.Active.remove(map)
    Metamaps.Maps.Featured.remove(map)
    Metamaps.Router.home()
    Metamaps.GlobalUI.notifyUser('Sorry! That map has been changed to Private.')
  },
  cantEditNow: function () {
    Metamaps.Realtime.turnOff(true); // true is for 'silence'
    Metamaps.GlobalUI.notifyUser('Map was changed to Public. Editing is disabled.')
    Metamaps.Active.Map.trigger('changeByOther')
  },
  canEditNow: function () {
    var confirmString = "You've been granted permission to edit this map. "
    confirmString += 'Do you want to reload and enable realtime collaboration?'
    var c = confirm(confirmString)
    if (c) {
      Metamaps.Router.maps(Metamaps.Active.Map.id)
    }
  },
  editedByActiveMapper: function () {
    if (Metamaps.Active.Mapper) {
      Metamaps.Mappers.add(Metamaps.Active.Mapper)
    }
  },
  getNextCoord: function () {
    var self = Metamaps.Map
    var nextX = self.nextX
    var nextY = self.nextY

    var DISTANCE_BETWEEN = 120

    self.nextX = self.nextX + DISTANCE_BETWEEN * self.nextXshift
    self.nextY = self.nextY + DISTANCE_BETWEEN * self.nextYshift

    self.timeToTurn += 1
    // if true, it's time to turn
    if (self.timeToTurn === self.sideLength) {
      self.turnCount += 1
      // if true, it's time to increase side length
      if (self.turnCount % 2 === 0) {
        self.sideLength += 1
      }
      self.timeToTurn = 0

      // going right? turn down
      if (self.nextXshift == 1 && self.nextYshift == 0) {
        self.nextXshift = 0
        self.nextYshift = 1
      }
      // going down? turn left
      else if (self.nextXshift == 0 && self.nextYshift == 1) {
        self.nextXshift = -1
        self.nextYshift = 0
      }
      // going left? turn up
      else if (self.nextXshift == -1 && self.nextYshift == 0) {
        self.nextXshift = 0
        self.nextYshift = -1
      }
      // going up? turn right
      else if (self.nextXshift == 0 && self.nextYshift == -1) {
        self.nextXshift = 1
        self.nextYshift = 0
      }
    }

    return {
      x: nextX,
      y: nextY
    }
  },
  resetSpiral: function () {
    Metamaps.Map.nextX = 0
    Metamaps.Map.nextY = 0
    Metamaps.Map.nextXshift = 1
    Metamaps.Map.nextYshift = 0
    Metamaps.Map.sideLength = 1
    Metamaps.Map.timeToTurn = 0
    Metamaps.Map.turnCount = 0
  },
  exportImage: function () {
    var canvas = {}

    canvas.canvas = document.createElement('canvas')
    canvas.canvas.width = 1880 // 960
    canvas.canvas.height = 1260 // 630

    canvas.scaleOffsetX = 1
    canvas.scaleOffsetY = 1
    canvas.translateOffsetY = 0
    canvas.translateOffsetX = 0
    canvas.denySelected = true

    canvas.getSize = function () {
      if (this.size) return this.size
      var canvas = this.canvas
      return this.size = {
        width: canvas.width,
        height: canvas.height
      }
    }
    canvas.scale = function (x, y) {
      var px = this.scaleOffsetX * x,
        py = this.scaleOffsetY * y
      var dx = this.translateOffsetX * (x - 1) / px,
        dy = this.translateOffsetY * (y - 1) / py
      this.scaleOffsetX = px
      this.scaleOffsetY = py
      this.getCtx().scale(x, y)
      this.translate(dx, dy)
    }
    canvas.translate = function (x, y) {
      var sx = this.scaleOffsetX,
        sy = this.scaleOffsetY
      this.translateOffsetX += x * sx
      this.translateOffsetY += y * sy
      this.getCtx().translate(x, y)
    }
    canvas.getCtx = function () {
      return this.canvas.getContext('2d')
    }
    // center it
    canvas.getCtx().translate(1880 / 2, 1260 / 2)

    var mGraph = Metamaps.Visualize.mGraph

    var id = mGraph.root
    var root = mGraph.graph.getNode(id)
    var T = !!root.visited

    // pass true to avoid basing it on a selection
    Metamaps.JIT.zoomExtents(null, canvas, true)

    var c = canvas.canvas,
      ctx = canvas.getCtx(),
      scale = canvas.scaleOffsetX

    // draw a grey background
    ctx.fillStyle = '#d8d9da'
    var xPoint = (-(c.width / scale) / 2) - (canvas.translateOffsetX / scale),
      yPoint = (-(c.height / scale) / 2) - (canvas.translateOffsetY / scale)
    ctx.fillRect(xPoint, yPoint, c.width / scale, c.height / scale)

    // draw the graph
    mGraph.graph.eachNode(function (node) {
      var nodeAlpha = node.getData('alpha')
      node.eachAdjacency(function (adj) {
        var nodeTo = adj.nodeTo
        if (!!nodeTo.visited === T && node.drawn && nodeTo.drawn) {
          mGraph.fx.plotLine(adj, canvas)
        }
      })
      if (node.drawn) {
        mGraph.fx.plotNode(node, canvas)
      }
      if (!mGraph.labelsHidden) {
        if (node.drawn && nodeAlpha >= 0.95) {
          mGraph.labels.plotLabel(canvas, node)
        } else {
          mGraph.labels.hideLabel(node, false)
        }
      }
      node.visited = !T
    })

    var imageData = {
      encoded_image: canvas.canvas.toDataURL()
    }

    var map = Metamaps.Active.Map

    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth() + 1; // January is 0!
    var yyyy = today.getFullYear()
    if (dd < 10) {
      dd = '0' + dd
    }
    if (mm < 10) {
      mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy

    var mapName = map.get('name').split(' ').join([separator = '-'])
    var downloadMessage = ''
    downloadMessage += 'Captured map screenshot! '
    downloadMessage += "<a href='" + imageData.encoded_image + "' "
    downloadMessage += "download='metamap-" + map.id + '-' + mapName + '-' + today + ".png'>DOWNLOAD</a>"
    Metamaps.GlobalUI.notifyUser(downloadMessage)

    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: '/maps/' + Metamaps.Active.Map.id + '/upload_screenshot',
      data: imageData,
      success: function (data) {
        console.log('successfully uploaded map screenshot')
      },
      error: function () {
        console.log('failed to save map screenshot')
      }
    })
  }
}

/*
 *
 *   CHEATSHEET
 *
 */
Metamaps.Map.CheatSheet = {
  init: function () {
    // tab the cheatsheet
    $('#cheatSheet').tabs()
    $('#quickReference').tabs().addClass('ui-tabs-vertical ui-helper-clearfix')
    $('#quickReference .ui-tabs-nav li').removeClass('ui-corner-top').addClass('ui-corner-left')

    // id = the id of a vimeo video
    var switchVideo = function (element, id) {
      $('.tutorialItem').removeClass('active')
      $(element).addClass('active')
      $('#tutorialVideo').attr('src', '//player.vimeo.com/video/' + id)
    }

    $('#gettingStarted').click(function () {
      // switchVideo(this,'88334167')
    })
    $('#upYourSkillz').click(function () {
      // switchVideo(this,'100118167')
    })
    $('#advancedMapping').click(function () {
      // switchVideo(this,'88334167')
    })
  }
}; // end Metamaps.Map.CheatSheet

/*
 *
 *   INFOBOX
 *
 */
Metamaps.Map.InfoBox = {
  isOpen: false,
  changing: false,
  selectingPermission: false,
  changePermissionText: "<div class='tooltips'>As the creator, you can change the permission of this map, and the permission of all the topics and synapses you have authority to change will change as well.</div>",
  nameHTML: '<span class="best_in_place best_in_place_name" id="best_in_place_map_{{id}}_name" data-url="/maps/{{id}}" data-object="map" data-attribute="name" data-type="textarea" data-activator="#mapInfoName">{{name}}</span>',
  descHTML: '<span class="best_in_place best_in_place_desc" id="best_in_place_map_{{id}}_desc" data-url="/maps/{{id}}" data-object="map" data-attribute="desc" data-nil="Click to add description..." data-type="textarea" data-activator="#mapInfoDesc">{{desc}}</span>',
  init: function () {
    var self = Metamaps.Map.InfoBox

    $('.mapInfoIcon').click(self.toggleBox)
    $('.mapInfoBox').click(function (event) {
      event.stopPropagation()
    })
    $('body').click(self.close)

    self.attachEventListeners()

    

    self.generateBoxHTML = Hogan.compile($('#mapInfoBoxTemplate').html())
  },
  toggleBox: function (event) {
    var self = Metamaps.Map.InfoBox

    if (self.isOpen) self.close()
    else self.open()

    event.stopPropagation()
  },
  open: function () {
    var self = Metamaps.Map.InfoBox
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
    var self = Metamaps.Map.InfoBox

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
    var self = Metamaps.Map.InfoBox

    var map = Metamaps.Active.Map

    var obj = map.pick('permission', 'topic_count', 'synapse_count')

    var isCreator = map.authorizePermissionChange(Metamaps.Active.Mapper)
    var canEdit = map.authorizeToEdit(Metamaps.Active.Mapper)
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
    var self = Metamaps.Map.InfoBox

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
      Metamaps.Active.Map.set('name', name)
      Metamaps.Active.Map.trigger('saved')
    })

    $('.mapInfoDesc .best_in_place_desc').unbind('ajax:success').bind('ajax:success', function () {
      var desc = $(this).html()
      Metamaps.Active.Map.set('desc', desc)
      Metamaps.Active.Map.trigger('saved')
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
    $('.mapContributors .tip li a').click(Metamaps.Router.intercept)

    $('.mapInfoBox').unbind('.hideTip').bind('click.hideTip', function () {
      $('.mapContributors .tip').hide()
    })

    self.addTypeahead() 
  },
  addTypeahead: function () {
    var self = Metamaps.Map.InfoBox

    if (!Metamaps.Active.Map) return

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
    if (Metamaps.Active.Mapper && Metamaps.Active.Mapper.id === Metamaps.Active.Map.get('user_id')) {
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
    var self = Metamaps.Map.InfoBox
    Metamaps.Collaborators.remove(Metamaps.Collaborators.get(collaboratorId))
    var mapperIds = Metamaps.Collaborators.models.map(function (mapper) { return mapper.id })
    $.post('/maps/' + Metamaps.Active.Map.id + '/access', { access: mapperIds })
    self.updateNumbers()
  },
  addCollaborator: function (newCollaboratorId) {
    var self = Metamaps.Map.InfoBox

    if (Metamaps.Collaborators.get(newCollaboratorId)) {
      Metamaps.GlobalUI.notifyUser('That user already has access')
      return
    }

    function callback(mapper) {
      Metamaps.Collaborators.add(mapper)
      var mapperIds = Metamaps.Collaborators.models.map(function (mapper) { return mapper.id })
      $.post('/maps/' + Metamaps.Active.Map.id + '/access', { access: mapperIds })
      var name =  Metamaps.Collaborators.get(newCollaboratorId).get('name')
      Metamaps.GlobalUI.notifyUser(name + ' will be notified by email')
      self.updateNumbers()
    }

    $.getJSON('/users/' + newCollaboratorId + '.json', callback)
  },
  handleResultClick: function (event, item) {
    var self = Metamaps.Map.InfoBox

   self.addCollaborator(item.id)
   $('.collaboratorSearchField').typeahead('val', '')
  },
  updateNameDescPerm: function (name, desc, perm) {
    $('.mapInfoName .best_in_place_name').html(name)
    $('.mapInfoDesc .best_in_place_desc').html(desc)
    $('.mapInfoBox .mapPermission').removeClass('commons public private').addClass(perm)
  },
  createContributorList: function () {
    var self = Metamaps.Map.InfoBox
    var relevantPeople = Metamaps.Active.Map.get('permission') === 'commons' ? Metamaps.Mappers : Metamaps.Collaborators
    var activeMapperIsCreator = Metamaps.Active.Mapper && Metamaps.Active.Mapper.id === Metamaps.Active.Map.get('user_id')
    var string = ''
    string += '<ul>'

    relevantPeople.each(function (m) {
      var isCreator = Metamaps.Active.Map.get('user_id') === m.get('id')
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
    if (!Metamaps.Active.Map) return

    var self = Metamaps.Map.InfoBox
    var mapper = Metamaps.Active.Mapper
    var relevantPeople = Metamaps.Active.Map.get('permission') === 'commons' ? Metamaps.Mappers : Metamaps.Collaborators

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

    $('.mapEditedAt').html('<span>Last edited: </span>' + Metamaps.Util.nowDateFormatted())
  },
  onPermissionClick: function (event) {
    var self = Metamaps.Map.InfoBox

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
    var self = Metamaps.Map.InfoBox

    self.selectingPermission = false
    $('.mapPermission').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
    $('.mapPermission .permissionSelect').remove()
  },
  selectPermission: function (event) {
    var self = Metamaps.Map.InfoBox

    self.selectingPermission = false
    var permission = $(this).attr('class')
    Metamaps.Active.Map.save({
      permission: permission
    })
    Metamaps.Active.Map.updateMapWrapper()
    shareable = permission === 'private' ? '' : 'shareable'
    $('.mapPermission').removeClass('commons public private minimize').addClass(permission)
    $('.mapPermission .permissionSelect').remove()
    $('.mapInfoBox').removeClass('shareable').addClass(shareable)
    event.stopPropagation()
  },
  deleteActiveMap: function () {
    var confirmString = 'Are you sure you want to delete this map? '
    confirmString += 'This action is irreversible. It will not delete the topics and synapses on the map.'

    var doIt = confirm(confirmString)
    var map = Metamaps.Active.Map
    var mapper = Metamaps.Active.Mapper
    var authorized = map.authorizePermissionChange(mapper)

    if (doIt && authorized) {
      Metamaps.Map.InfoBox.close()
      Metamaps.Maps.Active.remove(map)
      Metamaps.Maps.Featured.remove(map)
      Metamaps.Maps.Mine.remove(map)
      Metamaps.Maps.Shared.remove(map)
      map.destroy()
      Metamaps.Router.home()
      Metamaps.GlobalUI.notifyUser('Map eliminated!')
    }
    else if (!authorized) {
      alert("Hey now. We can't just go around willy nilly deleting other people's maps now can we? Run off and find something constructive to do, eh?")
    }
  }
}; // end Metamaps.Map.InfoBox

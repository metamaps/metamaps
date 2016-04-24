/* global Metamaps, $ */

/*
 * Metamaps.TopicCard.js
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.GlobalUI
 *  - Metamaps.Mapper
 *  - Metamaps.Metacodes
 *  - Metamaps.Router
 *  - Metamaps.Util
 *  - Metamaps.Visualize
 */
Metamaps.TopicCard = {
  openTopicCard: null, // stores the topic that's currently open
  authorizedToEdit: false, // stores boolean for edit permission for open topic card
  init: function () {
    var self = Metamaps.TopicCard

    // initialize best_in_place editing
    $('.authenticated div.permission.canEdit .best_in_place').best_in_place()

    Metamaps.TopicCard.generateShowcardHTML = Hogan.compile($('#topicCardTemplate').html())

    // initialize topic card draggability and resizability
    $('.showcard').draggable({
      handle: '.metacodeImage'
    })

    embedly('on', 'card.rendered', self.embedlyCardRendered)
  },
  /**
   * Will open the Topic Card for the node that it's passed
   * @param {$jit.Graph.Node} node
   */
  showCard: function (node) {
    var self = Metamaps.TopicCard

    var topic = node.getData('topic')

    self.openTopicCard = topic
    self.authorizedToEdit = topic.authorizeToEdit(Metamaps.Active.Mapper)
    // populate the card that's about to show with the right topics data
    self.populateShowCard(topic)
    $('.showcard').fadeIn('fast')
  },
  hideCard: function () {
    var self = Metamaps.TopicCard

    $('.showcard').fadeOut('fast')
    self.openTopicCard = null
    self.authorizedToEdit = false
  },
  embedlyCardRendered: function (iframe) {
    var self = Metamaps.TopicCard

    $('#embedlyLinkLoader').hide()

    // means that the embedly call returned 404 not found
    if ($('#embedlyLink')[0]) {
      $('#embedlyLink').css('display', 'block').fadeIn('fast')
      $('.embeds').addClass('nonEmbedlyLink')
    }

    $('.CardOnGraph').addClass('hasAttachment')
    if (self.authorizedToEdit) {
      $('.embeds').append('<div id="linkremove"></div>')
      $('#linkremove').click(self.removeLink)
    }
  },
  removeLink: function () {
    var self = Metamaps.TopicCard
    self.openTopicCard.save({
      link: null
    })
    $('.embeds').empty().removeClass('nonEmbedlyLink')
    $('#addLinkInput input').val('')
    $('.attachments').removeClass('hidden')
    $('.CardOnGraph').removeClass('hasAttachment')
  },
  bindShowCardListeners: function (topic) {
    var self = Metamaps.TopicCard
    var showCard = document.getElementById('showcard')

    var authorized = self.authorizedToEdit

    // get mapper image
    var setMapperImage = function (mapper) {
      $('.contributorIcon').attr('src', mapper.get('image'))
    }
    Metamaps.Mapper.get(topic.get('user_id'), setMapperImage)

    // starting embed.ly
    var resetFunc = function () {
      $('#addLinkInput input').val('')
      $('#addLinkInput input').focus()
    }
    var inputEmbedFunc = function (event) {
      var element = this
      setTimeout(function () {
        var text = $(element).val()
        if (event.type == 'paste' || (event.type == 'keyup' && event.which == 13)) {
          // TODO evaluate converting this to '//' no matter what (infer protocol)
          if (text.slice(0, 7) !== 'http://' &&
            text.slice(0, 8) !== 'https://' &&
            text.slice(0, 2) !== '//') {
            text = '//' + text
          }
          topic.save({
            link: text
          })
          var embedlyEl = $('<a/>', {
            id: 'embedlyLink',
            'data-card-description': '0',
            href: text
          }).html(text)
          $('.attachments').addClass('hidden')
          $('.embeds').append(embedlyEl)
          $('.embeds').append('<div id="embedlyLinkLoader"></div>')
          var loader = new CanvasLoader('embedlyLinkLoader')
          loader.setColor('#4fb5c0'); // default is '#000000'
          loader.setDiameter(28) // default is 40
          loader.setDensity(41) // default is 40
          loader.setRange(0.9); // default is 1.3
          loader.show() // Hidden by default
          var e = embedly('card', document.getElementById('embedlyLink'))
          if (!e) {
            self.handleInvalidLink()
          }
        }
      }, 100)
    }
    $('#addLinkReset').click(resetFunc)
    $('#addLinkInput input').bind('paste keyup', inputEmbedFunc)

    // initialize the link card, if there is a link
    if (topic.get('link') && topic.get('link') !== '') {
      var loader = new CanvasLoader('embedlyLinkLoader')
      loader.setColor('#4fb5c0'); // default is '#000000'
      loader.setDiameter(28) // default is 40
      loader.setDensity(41) // default is 40
      loader.setRange(0.9); // default is 1.3
      loader.show() // Hidden by default
      var e = embedly('card', document.getElementById('embedlyLink'))
      if (!e) {
        self.handleInvalidLink()
      }
    }

    var selectingMetacode = false
    // attach the listener that shows the metacode title when you hover over the image
    $('.showcard .metacodeImage').mouseenter(function () {
      $('.showcard .icon').css('z-index', '4')
      $('.showcard .metacodeTitle').show()
    })
    $('.showcard .linkItem.icon').mouseleave(function () {
      if (!selectingMetacode) {
        $('.showcard .metacodeTitle').hide()
        $('.showcard .icon').css('z-index', '1')
      }
    })

    var metacodeLiClick = function () {
      selectingMetacode = false
      var metacodeId = parseInt($(this).attr('data-id'))
      var metacode = Metamaps.Metacodes.get(metacodeId)
      $('.CardOnGraph').find('.metacodeTitle').html(metacode.get('name'))
        .append('<div class="expandMetacodeSelect"></div>')
        .attr('class', 'metacodeTitle mbg' + metacode.id)
      $('.CardOnGraph').find('.metacodeImage').css('background-image', 'url(' + metacode.get('icon') + ')')
      topic.save({
        metacode_id: metacode.id
      })
      Metamaps.Visualize.mGraph.plot()
      $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
      $('.metacodeTitle').hide()
      $('.showcard .icon').css('z-index', '1')
    }

    var openMetacodeSelect = function (event) {
      var windowWidth
      var showcardLeft
      var TOPICCARD_WIDTH = 300
      var METACODESELECT_WIDTH = 404
      var distanceFromEdge

      var MAX_METACODELIST_HEIGHT = 270
      var windowHeight
      var showcardTop
      var topicTitleHeight
      var distanceFromBottom

      if (!selectingMetacode) {
        selectingMetacode = true

        // this is to make sure the metacode
        // select is accessible onscreen, when opened
        // while topic card is close to the right
        // edge of the screen
        windowWidth = $(window).width()
        showcardLeft = parseInt($('.showcard').css('left'))
        distanceFromEdge = windowWidth - (showcardLeft + TOPICCARD_WIDTH)
        if (distanceFromEdge < METACODESELECT_WIDTH) {
          $('.metacodeSelect').addClass('onRightEdge')
        }

        // this is to make sure the metacode
        // select is accessible onscreen, when opened
        // while topic card is close to the bottom
        // edge of the screen
        windowHeight = $(window).height()
        showcardTop = parseInt($('.showcard').css('top'))
        topicTitleHeight = $('.showcard .title').height() + parseInt($('.showcard .title').css('padding-top')) + parseInt($('.showcard .title').css('padding-bottom'))
        heightOfSetList = $('.showcard .metacodeSelect').height()
        distanceFromBottom = windowHeight - (showcardTop + topicTitleHeight)
        if (distanceFromBottom < MAX_METACODELIST_HEIGHT) {
          $('.metacodeSelect').addClass('onBottomEdge')
        }

        $('.metacodeSelect').show()
        event.stopPropagation()
      }
    }

    var hideMetacodeSelect = function () {
      selectingMetacode = false
      $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
      $('.metacodeTitle').hide()
      $('.showcard .icon').css('z-index', '1')
    }

    if (authorized) {
      $('.showcard .metacodeTitle').click(openMetacodeSelect)
      $('.showcard').click(hideMetacodeSelect)
      $('.metacodeSelect > ul > li').click(function (event) {
        event.stopPropagation()
      })
      $('.metacodeSelect li li').click(metacodeLiClick)

      var bipName = $(showCard).find('.best_in_place_name')
      bipName.bind('best_in_place:activate', function () {
        var $el = bipName.find('textarea')
        var el = $el[0]

        $el.attr('maxlength', '140')

        $('.showcard .title').append('<div class="nameCounter forTopic"></div>')

        var callback = function (data) {
          $('.nameCounter.forTopic').html(data.all + '/140')
        }
        Countable.live(el, callback)
      })
      bipName.bind('best_in_place:deactivate', function () {
        $('.nameCounter.forTopic').remove()
      })

      // bind best_in_place ajax callbacks
      bipName.bind('ajax:success', function () {
        var name = Metamaps.Util.decodeEntities($(this).html())
        topic.set('name', name)
        topic.trigger('saved')
      })

      $(showCard).find('.best_in_place_desc').bind('ajax:success', function () {
        this.innerHTML = this.innerHTML.replace(/\r/g, '')
        var desc = $(this).html() === $(this).data('nil') ? '' : $(this).html()
        topic.set('desc', desc)
        topic.trigger('saved')
      })
    }

    var permissionLiClick = function (event) {
      selectingPermission = false
      var permission = $(this).attr('class')
      topic.save({
        permission: permission,
        defer_to_map_id: null
      })
      $('.showcard .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2))
      $('.showcard .permissionSelect').remove()
      event.stopPropagation()
    }

    var openPermissionSelect = function (event) {
      if (!selectingPermission) {
        selectingPermission = true
        $(this).addClass('minimize') // this line flips the drop down arrow to a pull up arrow
        if ($(this).hasClass('co')) {
          $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>')
        } else if ($(this).hasClass('pu')) {
          $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>')
        } else if ($(this).hasClass('pr')) {
          $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>')
        }
        $('.showcard .permissionSelect li').click(permissionLiClick)
        event.stopPropagation()
      }
    }

    var hidePermissionSelect = function () {
      selectingPermission = false
      $('.showcard .yourTopic .mapPerm').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
      $('.showcard .permissionSelect').remove()
    }
    // ability to change permission
    var selectingPermission = false
    if (topic.authorizePermissionChange(Metamaps.Active.Mapper)) {
      $('.showcard .yourTopic .mapPerm').click(openPermissionSelect)
      $('.showcard').click(hidePermissionSelect)
    }

    $('.links .mapCount').unbind().click(function (event) {
      $('.mapCount .tip').toggle()
      $('.showcard .hoverTip').toggleClass('hide')
      event.stopPropagation()
    })
    $('.mapCount .tip').unbind().click(function (event) {
      event.stopPropagation()
    })
    $('.showcard').unbind('.hideTip').bind('click.hideTip', function () {
      $('.mapCount .tip').hide()
      $('.showcard .hoverTip').removeClass('hide')
    })

    $('.mapCount .tip li a').click(Metamaps.Router.intercept)

    var originalText = $('.showMore').html()
    $('.mapCount .tip .showMore').unbind().toggle(
      function (event) {
        $('.extraText').toggleClass('hideExtra')
        $('.showMore').html('Show less...')
      },
      function (event) {
        $('.extraText').toggleClass('hideExtra')
        $('.showMore').html(originalText)
      })

    $('.mapCount .tip showMore').unbind().click(function (event) {
      event.stopPropagation()
    })
  },
  handleInvalidLink: function () {
    var self = Metamaps.TopicCard

    self.removeLink()
    Metamaps.GlobalUI.notifyUser('Invalid link')
  },
  populateShowCard: function (topic) {
    var self = Metamaps.TopicCard

    var showCard = document.getElementById('showcard')

    $(showCard).find('.permission').remove()

    var topicForTemplate = self.buildObject(topic)
    var html = self.generateShowcardHTML.render(topicForTemplate)

    if (topic.authorizeToEdit(Metamaps.Active.Mapper)) {
      var perm = document.createElement('div')

      var string = 'permission canEdit'
      if (topic.authorizePermissionChange(Metamaps.Active.Mapper)) string += ' yourTopic'
      perm.className = string
      perm.innerHTML = html
      showCard.appendChild(perm)
    } else {
      var perm = document.createElement('div')
      perm.className = 'permission cannotEdit'
      perm.innerHTML = html
      showCard.appendChild(perm)
    }

    Metamaps.TopicCard.bindShowCardListeners(topic)
  },
  generateShowcardHTML: null, // will be initialized into a Hogan template within init function
  // generateShowcardHTML
  buildObject: function (topic) {
    var self = Metamaps.TopicCard

    var nodeValues = {}

    var authorized = topic.authorizeToEdit(Metamaps.Active.Mapper)

    if (!authorized) {
    } else {
    }

    var desc_nil = 'Click to add description...'

    nodeValues.attachmentsHidden = ''
    if (topic.get('link') && topic.get('link') !== '') {
      nodeValues.embeds = '<a href="' + topic.get('link') + '" id="embedlyLink" target="_blank" data-card-description="0">'
      nodeValues.embeds += topic.get('link')
      nodeValues.embeds += '</a><div id="embedlyLinkLoader"></div>'
      nodeValues.attachmentsHidden = 'hidden'
      nodeValues.hasAttachment = 'hasAttachment'
    } else {
      nodeValues.embeds = ''
      nodeValues.hasAttachment = ''
    }

    if (authorized) {
      nodeValues.attachments = '<div class="addLink"><div id="addLinkIcon"></div>'
      nodeValues.attachments += '<div id="addLinkInput"><input placeholder="Enter or paste a link"></input>'
      nodeValues.attachments += '<div id="addLinkReset"></div></div></div>'
    } else {
      nodeValues.attachmentsHidden = 'hidden'
      nodeValues.attachments = ''
    }

    var inmapsAr = topic.get('inmaps')
    var inmapsLinks = topic.get('inmapsLinks')
    nodeValues.inmaps = ''
    if (inmapsAr.length < 6) {
      for (i = 0; i < inmapsAr.length; i++) {
        var url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
    } else {
      for (i = 0; i < 5; i++) {
        var url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
      extra = inmapsAr.length - 5
      nodeValues.inmaps += '<li><span class="showMore">See ' + extra + ' more...</span></li>'
      for (i = 5; i < inmapsAr.length; i++) {
        var url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li class="hideExtra extraText"><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
    }
    nodeValues.permission = topic.get('calculated_permission')
    nodeValues.mk_permission = topic.get('calculated_permission').substring(0, 2)
    nodeValues.map_count = topic.get('map_count').toString()
    nodeValues.synapse_count = topic.get('synapse_count').toString()
    nodeValues.id = topic.isNew() ? topic.cid : topic.id
    nodeValues.metacode = topic.getMetacode().get('name')
    nodeValues.metacode_class = 'mbg' + topic.get('metacode_id')
    nodeValues.imgsrc = topic.getMetacode().get('icon')
    nodeValues.name = topic.get('name')
    nodeValues.userid = topic.get('user_id')
    nodeValues.username = topic.get('user_name')
    nodeValues.date = topic.getDate()
    // the code for this is stored in /views/main/_metacodeOptions.html.erb
    nodeValues.metacode_select = $('#metacodeOptions').html()
    nodeValues.desc_nil = desc_nil
    nodeValues.desc = (topic.get('desc') == '' && authorized) ? desc_nil : topic.get('desc')
    return nodeValues
  }
}; // end Metamaps.TopicCard

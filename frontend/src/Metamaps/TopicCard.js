/* global $, CanvasLoader, Countable, Hogan, embedly */

import Active from './Active'
import DataModel from './DataModel'
import GlobalUI from './GlobalUI'
import Mapper from './Mapper'
import Router from './Router'
import Util from './Util'
import Visualize from './Visualize'

const TopicCard = {
  openTopicCard: null, // stores the topic that's currently open
  authorizedToEdit: false, // stores boolean for edit permission for open topic card
  RAILS_ENV: undefined,
  init: function(serverData) {
    var self = TopicCard

    if (serverData.RAILS_ENV) {
      self.RAILS_ENV = serverData.RAILS_ENV
    } else {
      console.error('RAILS_ENV is not defined! See TopicCard.js init function.')
    }

    // initialize best_in_place editing
    $('.authenticated div.permission.canEdit .best_in_place').best_in_place()

    TopicCard.generateShowcardHTML = Hogan.compile($('#topicCardTemplate').html())

    // initialize topic card draggability and resizability
    $('.showcard').draggable({
      handle: '.metacodeImage',
      stop: function() {
        $(this).height('auto')
      }
    })

    embedly('on', 'card.rendered', self.embedlyCardRendered)
  },
  /**
   * Will open the Topic Card for the node that it's passed
   * @param {$jit.Graph.Node} node
   */
  showCard: function(node, opts) {
    var self = TopicCard
    if (!opts) opts = {}
    var topic = node.getData('topic')

    self.openTopicCard = topic
    self.authorizedToEdit = topic.authorizeToEdit(Active.Mapper)
    // populate the card that's about to show with the right topics data
    self.populateShowCard(topic)
    return $('.showcard').fadeIn('fast', function() {
      if (opts.complete) {
        opts.complete()
      }
    })
  },
  hideCard: function() {
    var self = TopicCard

    $('.showcard').fadeOut('fast')
    self.openTopicCard = null
    self.authorizedToEdit = false
  },
  embedlyCardRendered: function(iframe) {
    $('#embedlyLinkLoader').hide()

    // means that the embedly call returned 404 not found
    if ($('#embedlyLink')[0]) {
      $('#embedlyLink').css('display', 'block').fadeIn('fast')
      $('.embeds').addClass('nonEmbedlyLink')
    }

    $('.CardOnGraph').addClass('hasAttachment')
  },
  showLinkRemover: function() {
    if (TopicCard.authorizedToEdit && $('#linkremove').length === 0) {
      $('.embeds').append('<div id="linkremove"></div>')
      $('#linkremove').click(TopicCard.removeLink)
    }
  },
  removeLink: function() {
    var self = TopicCard
    self.openTopicCard.save({
      link: null
    })
    $('.embeds').empty().removeClass('nonEmbedlyLink')
    $('#addLinkInput input').val('')
    $('.attachments').removeClass('hidden')
    $('.CardOnGraph').removeClass('hasAttachment')
  },
  showLinkLoader: function() {
    var loader = new CanvasLoader('embedlyLinkLoader')
    loader.setColor('#4fb5c0') // default is '#000000'
    loader.setDiameter(28) // default is 40
    loader.setDensity(41) // default is 40
    loader.setRange(0.9) // default is 1.3
    loader.show() // Hidden by default
  },
  showLink: function(topic) {
    var e = embedly('card', document.getElementById('embedlyLink'))
    if (!e && TopicCard.RAILS_ENV !== 'development') {
      TopicCard.handleInvalidLink()
    } else if (!e) {
      $('#embedlyLink').attr('target', '_blank').html(topic.get('link')).show()
      $('#embedlyLinkLoader').hide()
    }
  },
  bindShowCardListeners: function(topic) {
    var self = TopicCard
    var showCard = document.getElementById('showcard')

    var authorized = self.authorizedToEdit

    // get mapper image
    var setMapperImage = function(mapper) {
      $('.contributorIcon').attr('src', mapper.get('image'))
    }
    Mapper.get(topic.get('user_id'), setMapperImage)

    // starting embed.ly
    var resetFunc = function() {
      $('#addLinkInput input').val('')
      $('#addLinkInput input').focus()
    }
    var inputEmbedFunc = function(event) {
      var element = this
      setTimeout(function() {
        var text = $(element).val()
        if (event.type === 'paste' || (event.type === 'keyup' && event.which === 13)) {
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

          self.showLinkLoader()
          self.showLink(topic)
        }
      }, 100)
    }
    $('#addLinkReset').click(resetFunc)
    $('#addLinkInput input').bind('paste keyup', inputEmbedFunc)

    // initialize the link card, if there is a link
    if (topic.get('link') && topic.get('link') !== '') {
      self.showLinkLoader()
      self.showLink(topic)
      self.showLinkRemover()
    }

    var selectingMetacode = false
    // attach the listener that shows the metacode title when you hover over the image
    $('.showcard .metacodeImage').mouseenter(function() {
      $('.showcard .icon').css('z-index', '4')
      $('.showcard .metacodeTitle').show()
    })
    $('.showcard .linkItem.icon').mouseleave(function() {
      if (!selectingMetacode) {
        $('.showcard .metacodeTitle').hide()
        $('.showcard .icon').css('z-index', '1')
      }
    })

    var metacodeLiClick = function() {
      selectingMetacode = false
      var metacodeId = parseInt($(this).attr('data-id'))
      var metacode = DataModel.Metacodes.get(metacodeId)
      $('.CardOnGraph').find('.metacodeTitle').html(metacode.get('name'))
        .append('<div class="expandMetacodeSelect"></div>')
        .attr('class', 'metacodeTitle mbg' + metacode.id)
      $('.CardOnGraph').find('.metacodeImage').css('background-image', 'url(' + metacode.get('icon') + ')')
      topic.save({
        metacode_id: metacode.id
      })
      Visualize.mGraph.plot()
      $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
      $('.metacodeTitle').hide()
      $('.showcard .icon').css('z-index', '1')
    }

    var openMetacodeSelect = function(event) {
      var TOPICCARD_WIDTH = 300
      var METACODESELECT_WIDTH = 404
      var MAX_METACODELIST_HEIGHT = 270

      if (!selectingMetacode) {
        selectingMetacode = true

        // this is to make sure the metacode
        // select is accessible onscreen, when opened
        // while topic card is close to the right
        // edge of the screen
        var windowWidth = $(window).width()
        var showcardLeft = parseInt($('.showcard').css('left'))
        var distanceFromEdge = windowWidth - (showcardLeft + TOPICCARD_WIDTH)
        if (distanceFromEdge < METACODESELECT_WIDTH) {
          $('.metacodeSelect').addClass('onRightEdge')
        }

        // this is to make sure the metacode
        // select is accessible onscreen, when opened
        // while topic card is close to the bottom
        // edge of the screen
        var windowHeight = $(window).height()
        var showcardTop = parseInt($('.showcard').css('top'))
        var topicTitleHeight = $('.showcard .title').height() + parseInt($('.showcard .title').css('padding-top')) + parseInt($('.showcard .title').css('padding-bottom'))
        var distanceFromBottom = windowHeight - (showcardTop + topicTitleHeight)
        if (distanceFromBottom < MAX_METACODELIST_HEIGHT) {
          $('.metacodeSelect').addClass('onBottomEdge')
        }

        $('.metacodeSelect').show()
        event.stopPropagation()
      }
    }

    var hideMetacodeSelect = function() {
      selectingMetacode = false
      $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
      $('.metacodeTitle').hide()
      $('.showcard .icon').css('z-index', '1')
    }

    if (authorized) {
      $('.showcard .metacodeTitle').click(openMetacodeSelect)
      $('.showcard').click(hideMetacodeSelect)
      $('.metacodeSelect > ul > li').click(function(event) {
        event.stopPropagation()
      })
      $('.metacodeSelect li li').click(metacodeLiClick)

      var bipName = $(showCard).find('.best_in_place_name')
      bipName.bind('best_in_place:activate', function() {
        var $el = bipName.find('textarea')
        var el = $el[0]

        $el.attr('maxlength', '140')

        $('.showcard .title').append('<div class="nameCounter forTopic"></div>')

        var callback = function(data) {
          $('.nameCounter.forTopic').html(data.all + '/140')
        }
        Countable.live(el, callback)
      })
      bipName.bind('best_in_place:deactivate', function() {
        $('.nameCounter.forTopic').remove()
      })
      bipName.keypress(function(e) {
        const ENTER = 13
        if (e.which === ENTER) { // enter
          $(this).data('bestInPlaceEditor').update()
        }
      })

      // bind best_in_place ajax callbacks
      bipName.bind('ajax:success', function() {
        var name = Util.decodeEntities($(this).html())
        topic.set('name', name)
        topic.trigger('saved')
      })

      // this is for all subsequent renders after in-place editing the desc field
      const bipDesc = $(showCard).find('.best_in_place_desc')
      bipDesc.bind('ajax:success', function() {
        var desc = $(this).html() === $(this).data('bip-nil')
          ? ''
          : $(this).text()
        topic.set('desc', desc)
        $(this).data('bip-value', desc)
        this.innerHTML = Util.mdToHTML(desc)
        topic.trigger('saved')
      })
      bipDesc.keypress(function(e) {
        // allow typing Enter with Shift+Enter
        const ENTER = 13
        if (e.shiftKey === false && e.which === ENTER) {
          $(this).data('bestInPlaceEditor').update()
        }
      })
    }

    var permissionLiClick = function(event) {
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

    var openPermissionSelect = function(event) {
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

    var hidePermissionSelect = function() {
      selectingPermission = false
      $('.showcard .yourTopic .mapPerm').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
      $('.showcard .permissionSelect').remove()
    }
    // ability to change permission
    var selectingPermission = false
    if (topic.authorizePermissionChange(Active.Mapper)) {
      $('.showcard .yourTopic .mapPerm').click(openPermissionSelect)
      $('.showcard').click(hidePermissionSelect)
    }

    $('.links .mapCount').unbind().click(function(event) {
      $('.mapCount .tip').toggle()
      $('.showcard .hoverTip').toggleClass('hide')
      event.stopPropagation()
    })
    $('.mapCount .tip').unbind().click(function(event) {
      event.stopPropagation()
    })
    $('.showcard').unbind('.hideTip').bind('click.hideTip', function() {
      $('.mapCount .tip').hide()
      $('.showcard .hoverTip').removeClass('hide')
    })

    $('.mapCount .tip li a').click(Router.intercept)

    var originalText = $('.showMore').html()
    $('.mapCount .tip .showMore').unbind().toggle(
      function(event) {
        $('.extraText').toggleClass('hideExtra')
        $('.showMore').html('Show less...')
      },
      function(event) {
        $('.extraText').toggleClass('hideExtra')
        $('.showMore').html(originalText)
      })

    $('.mapCount .tip showMore').unbind().click(function(event) {
      event.stopPropagation()
    })
  },
  handleInvalidLink: function() {
    var self = TopicCard

    self.removeLink()
    GlobalUI.notifyUser('Invalid link')
  },
  populateShowCard: function(topic) {
    var self = TopicCard

    var showCard = document.getElementById('showcard')

    $(showCard).find('.permission').remove()

    var topicForTemplate = self.buildObject(topic)
    var html = self.generateShowcardHTML.render(topicForTemplate)

    if (topic.authorizeToEdit(Active.Mapper)) {
      let perm = document.createElement('div')

      var string = 'permission canEdit'
      if (topic.authorizePermissionChange(Active.Mapper)) string += ' yourTopic'
      perm.className = string
      perm.innerHTML = html
      showCard.appendChild(perm)
    } else {
      let perm = document.createElement('div')
      perm.className = 'permission cannotEdit'
      perm.innerHTML = html
      showCard.appendChild(perm)
    }

    TopicCard.bindShowCardListeners(topic)
  },
  generateShowcardHTML: null, // will be initialized into a Hogan template within init function
  // generateShowcardHTML
  buildObject: function(topic) {
    var nodeValues = {}

    var authorized = topic.authorizeToEdit(Active.Mapper)

    if (!authorized) {
    } else {
    }

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

    var inmapsAr = topic.get('inmaps') || []
    var inmapsLinks = topic.get('inmapsLinks') || []
    nodeValues.inmaps = ''
    if (inmapsAr.length < 6) {
      for (let i = 0; i < inmapsAr.length; i++) {
        const url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
      const extra = inmapsAr.length - 5
      nodeValues.inmaps += '<li><span class="showMore">See ' + extra + ' more...</span></li>'
      for (let i = 5; i < inmapsAr.length; i++) {
        const url = '/maps/' + inmapsLinks[i]
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
    nodeValues.desc_nil = 'Click to add description...'
    nodeValues.desc_markdown = (topic.get('desc') === '' && authorized)
     ? nodeValues.desc_nil
     : topic.get('desc')
    nodeValues.desc_html = Util.mdToHTML(nodeValues.desc_markdown)
    return nodeValues
  }
}

export default TopicCard

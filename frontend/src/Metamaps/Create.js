/* global Metamaps, $, Hogan, Bloodhound */

import React from 'react'
import ReactDOM from 'react-dom'

import DataModel from './DataModel'
import Engine from './Engine'
import MetacodeSelect from '../components/MetacodeSelect'
import Mouse from './Mouse'
import Selected from './Selected'
import Synapse from './Synapse'
import Topic from './Topic'
import Util from './Util'
import Visualize from './Visualize'
import GlobalUI from './GlobalUI'

const Create = {
  isSwitchingSet: false, // indicates whether the metacode set switch lightbox is open
  selectedMetacodeSet: null,
  selectedMetacodeSetIndex: null,
  selectedMetacodeNames: [],
  newSelectedMetacodeNames: [],
  selectedMetacodes: [],
  newSelectedMetacodes: [],
  recentMetacodes: [],
  mostUsedMetacodes: [],
  init: function (serverData) {
    var self = Create
    self.newTopic.init(serverData)
    self.newSynapse.init()

    // // SWITCHING METACODE SETS

    $('#metacodeSwitchTabs').tabs({
      active: self.selectedMetacodeSetIndex
    }).addClass('ui-tabs-vertical ui-helper-clearfix')
    $('#metacodeSwitchTabs .ui-tabs-nav li').removeClass('ui-corner-top').addClass('ui-corner-left')
    $('.customMetacodeList li').click(self.toggleMetacodeSelected) // within the custom metacode set tab
  },
  toggleMetacodeSelected: function() {
    var self = Create

    if ($(this).attr('class') !== 'toggledOff') {
      $(this).addClass('toggledOff')
      var valueToRemove = $(this).attr('id')
      var nameToRemove = $(this).attr('data-name')
      self.newSelectedMetacodes.splice(self.newSelectedMetacodes.indexOf(valueToRemove), 1)
      self.newSelectedMetacodeNames.splice(self.newSelectedMetacodeNames.indexOf(nameToRemove), 1)
    } else if ($(this).attr('class') === 'toggledOff') {
      $(this).removeClass('toggledOff')
      self.newSelectedMetacodes.push($(this).attr('id'))
      self.newSelectedMetacodeNames.push($(this).attr('data-name'))
    }
  },
  updateMetacodeSet: function(set, index, custom) {
    if (custom && Create.newSelectedMetacodes.length === 0) {
      window.alert('Please select at least one metacode to use!')
      return false
    }

    var codesToSwitchToIds
    var metacodeModels = new DataModel.MetacodeCollection()
    Create.selectedMetacodeSetIndex = index
    Create.selectedMetacodeSet = 'metacodeset-' + set

    if (!custom) {
      codesToSwitchToIds = $('#metacodeSwitchTabs' + set).attr('data-metacodes').split(',')
      $('.customMetacodeList li').addClass('toggledOff')
console.log(codesToSwitchToIds)
      Create.selectedMetacodes = codesToSwitchToIds
      Create.selectedMetacodeNames = DataModel.Metacodes.filter(m => codesToSwitchToIds.indexOf(m.id) > -1).map(m => m.get('name'))  
      Create.newSelectedMetacodes = codesToSwitchToIds
      Create.newSelectedMetacodeNames = DataModel.Metacodes.filter(m => codesToSwitchToIds.indexOf(m.id) > -1).map(m => m.get('name'))  
    } else if (custom) {
      // uses .slice to avoid setting the two arrays to the same actual array
      Create.selectedMetacodes = Create.newSelectedMetacodes.slice(0)
      Create.selectedMetacodeNames = Create.newSelectedMetacodeNames.slice(0)
      codesToSwitchToIds = Create.selectedMetacodes.slice(0)
    }

    // sort by name
    codesToSwitchToIds.forEach(id => {
      const metacode = DataModel.Metacodes.get(id)
      metacodeModels.add(metacode)
      $('.customMetacodeList #' + id).removeClass('toggledOff')
    })
    metacodeModels.sort()

    $('#metacodeImg').removeData('cloudcarousel')
    var newMetacodes = ''
    metacodeModels.each(function(metacode) {
      newMetacodes += '<img class="cloudcarousel" width="40" height="40" src="' + metacode.get('icon') + '" data-id="' + metacode.id + '" title="' + metacode.get('name') + '" alt="' + metacode.get('name') + '"/>'
    })

    $('#metacodeImg').empty().append(newMetacodes).CloudCarousel({
      yRadius: 40,
      xRadius: 190,
      xPos: 170,
      yPos: 40,
      speed: 0.3,
      bringToFront: true
    })

    Create.newTopic.setMetacode(metacodeModels.models[0].id)

    GlobalUI.closeLightbox()
    $('#topic_name').focus()

    var mdata = {
      'metacodes': {
        'value': custom ? Create.selectedMetacodes.toString() : Create.selectedMetacodeSet
      }
    }
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: '/user/updatemetacodes',
      data: mdata,
      success: function(data) {
        console.log('selected metacodes saved')
      },
      error: function() {
        console.log('failed to save selected metacodes')
      }
    })
  },

  cancelMetacodeSetSwitch: function() {
    var self = Create
    self.isSwitchingSet = false

    if (self.selectedMetacodeSet === 'metacodeset-custom') {
      // reset it to the current actual selection
      $('.customMetacodeList li').addClass('toggledOff')
      for (var i = 0; i < self.selectedMetacodes.length; i++) {
        $('#' + self.selectedMetacodes[i]).removeClass('toggledOff')
      }
      // uses .slice to avoid setting the two arrays to the same actual array
      self.newSelectedMetacodeNames = self.selectedMetacodeNames.slice(0)
      self.newSelectedMetacodes = self.selectedMetacodes.slice(0)
    }
    $('#metacodeSwitchTabs').tabs('option', 'active', self.selectedMetacodeSetIndex)
    $('#topic_name').focus()
  },
  newTopic: {
    init: function (serverData) {
      const DOWN_ARROW = 40
      const ESC = 27

      if (!serverData.ActiveMapper) return

      $('#topic_name').keyup(function (e) {

        Create.newTopic.name = $(this).val()
        if (e.which == DOWN_ARROW && !Create.newTopic.name.length) {
          Create.newTopic.openSelector()
        }

        if (e.keyCode === ESC) {
          Create.newTopic.hide()
        } // if
      })
      
      $('.selectedMetacode').click(function() {
        if (Create.newTopic.metacodeSelectorOpen) {
          Create.newTopic.hideSelector()
          $('#topic_name').focus()
        } else Create.newTopic.openSelector()
      })
      
      Create.newTopic.initSelector()
      
      var topicBloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/topics/autocomplete_topic?term=%QUERY',
          wildcard: '%QUERY'
        }
      })

      // initialize the autocomplete results for the metacode spinner
      $('#topic_name').typeahead(
        {
          highlight: true,
          minLength: 2
        },
        [{
          name: 'topic_autocomplete',
          limit: 8,
          display: function(s) { return s.label },
          templates: {
            suggestion: function(s) {
              return Hogan.compile($('#topicAutocompleteTemplate').html()).render(s)
            }
          },
          source: topicBloodhound
        }]
      )

      // tell the autocomplete to submit the form with the topic you clicked on if you pick from the autocomplete
      $('#topic_name').bind('typeahead:select', function(event, datum, dataset) {
        Create.newTopic.beingCreated = false
        if (datum.rtype === 'topic') {
          Topic.getTopicFromAutocomplete(datum.id)
        } else if (datum.rtype === 'map') {
          Topic.getMapFromAutocomplete({
            id: datum.id,
            name: datum.label
          })
        }
      })
      $('#topic_name').click(function() { Create.newTopic.hideSelector() })

      // initialize metacode spinner and then hide it
      $('#metacodeImg').CloudCarousel({
        yRadius: 40,
        xRadius: 190,
        xPos: 170,
        yPos: 40,
        speed: 0.3,
        bringToFront: true
      })
      $('#new_topic').hide()
        .css({ left: '50%', top: '50%' })
        .attr('oncontextmenu', 'return false') // prevents the mouse up event from opening the default context menu on this element
    },
    name: null,
    newId: 1,
    beingCreated: false,
    metacodeSelectorOpen: false,
    metacode: null,
    x: null,
    y: null,
    addSynapse: false,
    pinned: false,
    initSelector: function () {
      ReactDOM.render(
        React.createElement(MetacodeSelect, {
          onClick: function (id) {
            Create.newTopic.setMetacode(id)
            Create.newTopic.hideSelector()
            $('#topic_name').focus()
          },
          close: function () {
            Create.newTopic.hideSelector()
            $('#topic_name').focus()
          },
          metacodes: DataModel.Metacodes.filter(m => Create.selectedMetacodes.indexOf(m.id.toString()) > -1)
        }),
        document.getElementById('metacodeSelector')
      )
    },
    openSelector: function () {
      Create.newTopic.initSelector()
      $('#metacodeSelector').show()
      Create.newTopic.metacodeSelectorOpen = true
      $('.metacodeFilterInput').focus()
      $('.selectedMetacode').addClass('isBeingSelected')
    },
    hideSelector: function () {
      ReactDOM.unmountComponentAtNode(document.getElementById('metacodeSelector'))
      $('#metacodeSelector').hide()
      Create.newTopic.metacodeSelectorOpen = false
      $('.selectedMetacode').removeClass('isBeingSelected')
    },
    setMetacode: function (id) {
      Create.newTopic.metacode = id
      var metacode = DataModel.Metacodes.get(id)
      $('.selectedMetacode img').attr('src', metacode.get('icon'))
      $('.selectedMetacode span').html(metacode.get('name'))
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/user/update_metacode_focus',
        data: { value: id },
        success: function (data) {},
        error: function () {
          console.log('failed to save metacode focus')
        }
      })
    },
    reset: function() {
      $('#topic_name').typeahead('val', '')
      Create.newTopic.hideSelector()
    },
    position: function() {
      const pixels = Util.coordsToPixels(Visualize.mGraph, Mouse.newNodeCoords)
      $('#new_topic').css({
        left: pixels.x,
        top: pixels.y
      })
    }
  },
  newSynapse: {
    init: function() {
      var synapseBloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/search/synapses?term=%QUERY',
          wildcard: '%QUERY'
        }
      })
      var existingSynapseBloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/search/synapses?topic1id=%TOPIC1&topic2id=%TOPIC2',
          prepare: function(query, settings) {
            var self = Create.newSynapse
            if (Selected.Nodes.length < 2 && self.topic1id && self.topic2id) {
              settings.url = settings.url.replace('%TOPIC1', self.topic1id).replace('%TOPIC2', self.topic2id)
              return settings
            } else {
              return null
            }
          }
        }
      })

      // initialize the autocomplete results for synapse creation
      $('#synapse_desc').typeahead(
        {
          highlight: true,
          minLength: 2
        },
        [{
          name: 'synapse_autocomplete',
          display: function(s) { return s.label },
          templates: {
            suggestion: function(s) {
              return Hogan.compile("<div class='genericSynapseDesc'>{{label}}</div>").render(s)
            }
          },
          source: synapseBloodhound
        },
        {
          name: 'existing_synapses',
          limit: 50,
          display: function(s) { return s.label },
          templates: {
            suggestion: function(s) {
              return Hogan.compile($('#synapseAutocompleteTemplate').html()).render(s)
            },
            header: '<h3>Existing synapses</h3>'
          },
          source: existingSynapseBloodhound
        }]
      )

      $('#synapse_desc').keyup(function(e) {
        const ESC = 27

        if (e.keyCode === ESC) {
          Create.newSynapse.hide()
        } // if

        Create.newSynapse.description = $(this).val()
      })

      $('#synapse_desc').focusout(function() {
        if (Create.newSynapse.beingCreated) {
          Synapse.createSynapseLocally(Create.newSynapse.topic1id, Create.newSynapse.topic2id)
          Engine.runLayout()
          Create.newSynapse.hide()
        }
      })

      $('#synapse_desc').keydown(function(e) {
        const TAB = 9
        if (Create.newSynapse.beingCreated && e.keyCode === TAB) {
          e.preventDefault()
          Synapse.createSynapseLocally(Create.newSynapse.topic1id, Create.newSynapse.topic2id)
          Engine.runLayout()
          Create.newSynapse.hide()
        }
      })

      $('#synapse_desc').bind('typeahead:select', function(event, datum, dataset) {
        if (datum.id) { // if they clicked on an existing synapse get it
          Synapse.getSynapseFromAutocomplete(datum.id)
        } else {
          Create.newSynapse.description = datum.value
          Synapse.createSynapseLocally(Create.newSynapse.topic1id, Create.newSynapse.topic2id)
          Engine.runLayout()
          Create.newSynapse.hide()
        }
      })
    },
    focusNode: null,
    beingCreated: false,
    description: null,
    topic1id: null,
    topic2id: null,
    newSynapseId: null,
    open: function() {
      $('#new_synapse').fadeIn(100, function() {
        $('#synapse_desc').focus()
      })
      Create.newSynapse.beingCreated = true
    },
    hide: function() {
      $('#new_synapse').fadeOut('fast')
      $('#synapse_desc').typeahead('val', '')
      Create.newSynapse.beingCreated = false
      Create.newTopic.addSynapse = false
      Create.newSynapse.topic1id = 0
      Create.newSynapse.topic2id = 0
      Create.newSynapse.node1 = null
      Create.newSynapse.node2 = null
      Mouse.synapseStartCoordinates = []
      Mouse.synapseEndCoordinates = null
      if (Visualize.mGraph) Visualize.mGraph.plot()
    },
    updateForm: function() {
      let pixelPos, midpoint = {}
      if (Create.newSynapse.beingCreated) {
        Mouse.synapseEndCoordinates = {
          x: Create.newSynapse.node2.pos.getc().x,
          y: Create.newSynapse.node2.pos.getc().y
        }
        // position the form
        midpoint.x = Create.newSynapse.node1.pos.getc().x + (Create.newSynapse.node2.pos.getc().x - Create.newSynapse.node1.pos.getc().x) / 2
        midpoint.y = Create.newSynapse.node1.pos.getc().y + (Create.newSynapse.node2.pos.getc().y - Create.newSynapse.node1.pos.getc().y) / 2
        pixelPos = Util.coordsToPixels(Visualize.mGraph, midpoint)
        $('#new_synapse').css('left', pixelPos.x + 'px')
        $('#new_synapse').css('top', pixelPos.y + 'px')
      }
    }
  }
}

export default Create

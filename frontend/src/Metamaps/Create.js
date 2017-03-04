/* global $, Hogan, Bloodhound */

import DataModel from './DataModel'
import Mouse from './Mouse'
import Selected from './Selected'
import Synapse from './Synapse'
import Topic from './Topic'
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
  init: function() {
    var self = Create
    self.newTopic.init()
    self.newSynapse.init()

    // // SWITCHING METACODE SETS

    $('#metacodeSwitchTabs').tabs({
      active: self.selectedMetacodeSetIndex
    }).addClass('ui-tabs-vertical ui-helper-clearfix')
    $('#metacodeSwitchTabs .ui-tabs-nav li').removeClass('ui-corner-top').addClass('ui-corner-left')
    $('.customMetacodeList li').click(self.toggleMetacodeSelected) // within the custom metacode set tab
    $('.selectAll').click(self.metacodeSelectorSelectAll)
    $('.selectNone').click(self.metacodeSelectorSelectNone)
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
    self.updateSelectAllColors()
  },
  updateSelectAllColors: function() {
    $('.selectAll, .selectNone').removeClass('selected')
    if (Create.metacodeSelectorAreAllSelected()) {
      $('.selectAll').addClass('selected')
    } else if (Create.metacodeSelectorAreNoneSelected()) {
      $('.selectNone').addClass('selected')
    }
  },
  metacodeSelectorSelectAll: function() {
    $('.customMetacodeList li.toggledOff').each(Create.toggleMetacodeSelected)
    Create.updateSelectAllColors()
  },
  metacodeSelectorSelectNone: function() {
    $('.customMetacodeList li').not('.toggledOff').each(Create.toggleMetacodeSelected)
    Create.updateSelectAllColors()
  },
  metacodeSelectorAreAllSelected: function() {
    return $('.customMetacodeList li').toArray()
             .map(li => !$(li).is('.toggledOff')) // note the ! on this line
             .reduce((curr, prev) => curr && prev)
  },
  metacodeSelectorAreNoneSelected: function() {
    return $('.customMetacodeList li').toArray()
             .map(li => $(li).is('.toggledOff'))
             .reduce((curr, prev) => curr && prev)
  },
  metacodeSelectorToggleSelectAll: function() {
    // should be called when Create.isSwitchingSet is true and .customMetacodeList is visible
    if (!Create.isSwitchingSet) return
    if (!$('.customMetacodeList').is(':visible')) return

    // If all are selected, then select none. Otherwise, select all.
    if (Create.metacodeSelectorAreAllSelected()) {
      Create.metacodeSelectorSelectNone()
    } else {
      // if some, but not all, are selected, it still runs this function
      Create.metacodeSelectorSelectAll()
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
      Create.selectedMetacodes = []
      Create.selectedMetacodeNames = []
      Create.newSelectedMetacodes = []
      Create.newSelectedMetacodeNames = []
    } else if (custom) {
      // uses .slice to avoid setting the two arrays to the same actual array
      Create.selectedMetacodes = Create.newSelectedMetacodes.slice(0)
      Create.selectedMetacodeNames = Create.newSelectedMetacodeNames.slice(0)
      codesToSwitchToIds = Create.selectedMetacodes.slice(0)
    }

    // sort by name
    for (var i = 0; i < codesToSwitchToIds.length; i++) {
      metacodeModels.add(DataModel.Metacodes.get(codesToSwitchToIds[i]))
    }
    metacodeModels.sort()

    $('#metacodeImg, #metacodeImgTitle').empty()
    $('#metacodeImg').removeData('cloudcarousel')
    var newMetacodes = ''
    metacodeModels.each(function(metacode) {
      newMetacodes += '<img class="cloudcarousel" width="40" height="40" src="' + metacode.get('icon') + '" data-id="' + metacode.id + '" title="' + metacode.get('name') + '" alt="' + metacode.get('name') + '"/>'
    })

    $('#metacodeImg').empty().append(newMetacodes).CloudCarousel({
      titleBox: $('#metacodeImgTitle'),
      yRadius: 40,
      xRadius: 190,
      xPos: 170,
      yPos: 40,
      speed: 0.3,
      mouseWheel: true,
      bringToFront: true
    })

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

    if (self.selectedMetacodeSet !== 'metacodeset-custom') {
      $('.customMetacodeList li').addClass('toggledOff')
      self.selectedMetacodes = []
      self.selectedMetacodeNames = []
      self.newSelectedMetacodes = []
      self.newSelectedMetacodeNames = []
    } else { // custom set is selected
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
    init: function() {
      $('#topic_name').keyup(function(e) {
        const ESC = 27

        if (e.keyCode === ESC) {
          Create.newTopic.hide()
        } // if

        Create.newTopic.name = $(this).val()
      })

      $('.pinCarousel').click(function() {
        if (Create.newTopic.pinned) {
          $('.pinCarousel').removeClass('isPinned')
          Create.newTopic.pinned = false
        } else {
          $('.pinCarousel').addClass('isPinned')
          Create.newTopic.pinned = true
        }
      })

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

      // initialize metacode spinner and then hide it
      $('#metacodeImg').CloudCarousel({
        titleBox: $('#metacodeImgTitle'),
        yRadius: 40,
        xRadius: 190,
        xPos: 170,
        yPos: 40,
        speed: 0.3,
        mouseWheel: true,
        bringToFront: true
      })
      $('.new_topic').hide()
      $('#new_topic').attr('oncontextmenu', 'return false') // prevents the mouse up event from opening the default context menu on this element
    },
    name: null,
    newId: 1,
    beingCreated: false,
    metacode: null,
    x: null,
    y: null,
    addSynapse: false,
    pinned: false,
    open: function() {
      $('#new_topic').fadeIn('fast', function() {
        $('#topic_name').focus()
      })
      Create.newTopic.beingCreated = true
      Create.newTopic.name = ''
      GlobalUI.hideDiv('#instructions')
    },
    hide: function(force) {
      if (force || !Create.newTopic.pinned) {
        $('#new_topic').fadeOut('fast')
      }
      if (force) {
        $('.pinCarousel').removeClass('isPinned')
        Create.newTopic.pinned = false
      }
      if (DataModel.Topics.length === 0) {
        GlobalUI.showDiv('#instructions')
      }
      Create.newTopic.beingCreated = false
    },
    reset: function() {
      $('#topic_name').typeahead('val', '')
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
          Synapse.createSynapseLocally()
        }
      })

      $('#synapse_desc').keydown(function(e) {
        const TAB = 9
        if (Create.newSynapse.beingCreated && e.keyCode === TAB) {
          e.preventDefault()
          Synapse.createSynapseLocally()
        }
      })

      $('#synapse_desc').bind('typeahead:select', function(event, datum, dataset) {
        if (datum.id) { // if they clicked on an existing synapse get it
          Synapse.getSynapseFromAutocomplete(datum.id)
        } else {
          Create.newSynapse.description = datum.value
          Synapse.createSynapseLocally()
        }
      })
    },
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
      Mouse.synapseStartCoordinates = []
      if (Visualize.mGraph) Visualize.mGraph.plot()
    }
  }
}

export default Create

/* global Metamaps, $ */

/*
 * Metamaps.Create.js
 *
 * Dependencies:
 *  - Metamaps.Backbone
 *  - Metamaps.GlobalUI
 *  - Metamaps.Metacodes
 *  - Metamaps.Mouse
 *  - Metamaps.Selected
 *  - Metamaps.Synapse
 *  - Metamaps.Topic
 *  - Metamaps.Visualize
 */

Metamaps.Create = {
  isSwitchingSet: false, // indicates whether the metacode set switch lightbox is open
  selectedMetacodeSet: null,
  selectedMetacodeSetIndex: null,
  selectedMetacodeNames: [],
  newSelectedMetacodeNames: [],
  selectedMetacodes: [],
  newSelectedMetacodes: [],
  init: function () {
    var self = Metamaps.Create
    self.newTopic.init()
    self.newSynapse.init()

    // // SWITCHING METACODE SETS

    $('#metacodeSwitchTabs').tabs({
      selected: self.selectedMetacodeSetIndex
    }).addClass('ui-tabs-vertical ui-helper-clearfix')
    $('#metacodeSwitchTabs .ui-tabs-nav li').removeClass('ui-corner-top').addClass('ui-corner-left')
    $('.customMetacodeList li').click(self.toggleMetacodeSelected) // within the custom metacode set tab
  },
  toggleMetacodeSelected: function () {
    var self = Metamaps.Create

    if ($(this).attr('class') != 'toggledOff') {
      $(this).addClass('toggledOff')
      var value_to_remove = $(this).attr('id')
      var name_to_remove = $(this).attr('data-name')
      self.newSelectedMetacodes.splice(self.newSelectedMetacodes.indexOf(value_to_remove), 1)
      self.newSelectedMetacodeNames.splice(self.newSelectedMetacodeNames.indexOf(name_to_remove), 1)
    } else if ($(this).attr('class') == 'toggledOff') {
      $(this).removeClass('toggledOff')
      self.newSelectedMetacodes.push($(this).attr('id'))
      self.newSelectedMetacodeNames.push($(this).attr('data-name'))
    }
  },
  updateMetacodeSet: function (set, index, custom) {
    if (custom && Metamaps.Create.newSelectedMetacodes.length == 0) {
      alert('Please select at least one metacode to use!')
      return false
    }

    var codesToSwitchToIds
    var metacodeModels = new Metamaps.Backbone.MetacodeCollection()
    Metamaps.Create.selectedMetacodeSetIndex = index
    Metamaps.Create.selectedMetacodeSet = 'metacodeset-' + set

    if (!custom) {
      codesToSwitchToIds = $('#metacodeSwitchTabs' + set).attr('data-metacodes').split(',')
      $('.customMetacodeList li').addClass('toggledOff')
      Metamaps.Create.selectedMetacodes = []
      Metamaps.Create.selectedMetacodeNames = []
      Metamaps.Create.newSelectedMetacodes = []
      Metamaps.Create.newSelectedMetacodeNames = []
    }
    else if (custom) {
      // uses .slice to avoid setting the two arrays to the same actual array
      Metamaps.Create.selectedMetacodes = Metamaps.Create.newSelectedMetacodes.slice(0)
      Metamaps.Create.selectedMetacodeNames = Metamaps.Create.newSelectedMetacodeNames.slice(0)
      codesToSwitchToIds = Metamaps.Create.selectedMetacodes.slice(0)
    }

    // sort by name
    for (var i = 0; i < codesToSwitchToIds.length; i++) {
      metacodeModels.add(Metamaps.Metacodes.get(codesToSwitchToIds[i]))
    }
    metacodeModels.sort()

    $('#metacodeImg, #metacodeImgTitle').empty()
    $('#metacodeImg').removeData('cloudcarousel')
    var newMetacodes = ''
    metacodeModels.each(function (metacode) {
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

    Metamaps.GlobalUI.closeLightbox()
    $('#topic_name').focus()

    var mdata = {
      'metacodes': {
        'value': custom ? Metamaps.Create.selectedMetacodes.toString() : Metamaps.Create.selectedMetacodeSet
      }
    }
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: '/user/updatemetacodes',
      data: mdata,
      success: function (data) {
        console.log('selected metacodes saved')
      },
      error: function () {
        console.log('failed to save selected metacodes')
      }
    })
  },

  cancelMetacodeSetSwitch: function () {
    var self = Metamaps.Create
    self.isSwitchingSet = false

    if (self.selectedMetacodeSet != 'metacodeset-custom') {
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
    init: function () {
      $('#topic_name').keyup(function () {
        Metamaps.Create.newTopic.name = $(this).val()
      })
      
      $('.pinCarousel').click(function() {
        if (Metamaps.Create.newTopic.pinned) {
          $('.pinCarousel').removeClass('isPinned')
          Metamaps.Create.newTopic.pinned = false
        }
        else {
          $('.pinCarousel').addClass('isPinned')
          Metamaps.Create.newTopic.pinned = true
        }
      })

      var topicBloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/topics/autocomplete_topic?term=%QUERY',
          wildcard: '%QUERY',
        },
      })

      // initialize the autocomplete results for the metacode spinner
      $('#topic_name').typeahead(
        {
          highlight: true,
          minLength: 2,
        },
        [{
          name: 'topic_autocomplete',
          limit: 8,
          display: function (s) { return s.label; },
          templates: {
            suggestion: function (s) {
              return Hogan.compile($('#topicAutocompleteTemplate').html()).render(s)
            },
          },
          source: topicBloodhound,
        }]
      )

      // tell the autocomplete to submit the form with the topic you clicked on if you pick from the autocomplete
      $('#topic_name').bind('typeahead:select', function (event, datum, dataset) {
        Metamaps.Topic.getTopicFromAutocomplete(datum.id)
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
    },
    name: null,
    newId: 1,
    beingCreated: false,
    metacode: null,
    x: null,
    y: null,
    addSynapse: false,
    pinned: false,
    open: function () {
      $('#new_topic').fadeIn('fast', function () {
        $('#topic_name').focus()
      })
      Metamaps.Create.newTopic.beingCreated = true
      Metamaps.Create.newTopic.name = ''
    },
    hide: function (force) {
      if (force || !Metamaps.Create.newTopic.pinned) {
        $('#new_topic').fadeOut('fast')
        Metamaps.Create.newTopic.beingCreated = false
      }
      if (force) {
        $('.pinCarousel').removeClass('isPinned')
        Metamaps.Create.newTopic.pinned = false
      }
      $('#topic_name').typeahead('val', '')
    }
  },
  newSynapse: {
    init: function () {
      var self = Metamaps.Create.newSynapse

      var synapseBloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/search/synapses?term=%QUERY',
          wildcard: '%QUERY',
        },
      })
      var existingSynapseBloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/search/synapses?topic1id=%TOPIC1&topic2id=%TOPIC2',
          prepare: function (query, settings) {
            var self = Metamaps.Create.newSynapse
            if (Metamaps.Selected.Nodes.length < 2) {
              settings.url = settings.url.replace('%TOPIC1', self.topic1id).replace('%TOPIC2', self.topic2id)
              return settings
            } else {
              return null
            }
          },
        },
      })

      // initialize the autocomplete results for synapse creation
      $('#synapse_desc').typeahead(
        {
          highlight: true,
          minLength: 2,
        },
        [{
          name: 'synapse_autocomplete',
          display: function (s) { return s.label; },
          templates: {
            suggestion: function (s) {
              return Hogan.compile("<div class='genericSynapseDesc'>{{label}}</div>").render(s)
            },
          },
          source: synapseBloodhound,
        },
          {
            name: 'existing_synapses',
            limit: 50,
            display: function (s) { return s.label; },
            templates: {
              suggestion: function (s) {
                return Hogan.compile($('#synapseAutocompleteTemplate').html()).render(s)
              },
              header: '<h3>Existing synapses</h3>'
            },
            source: existingSynapseBloodhound,
          }]
      )

      $('#synapse_desc').keyup(function (e) {
        var ESC = 27, BACKSPACE = 8, DELETE = 46
        if (e.keyCode === BACKSPACE && $(this).val() === '' ||
          e.keyCode === DELETE && $(this).val() === '' ||
          e.keyCode === ESC) {
          Metamaps.Create.newSynapse.hide()
        } // if
        Metamaps.Create.newSynapse.description = $(this).val()
      })

      $('#synapse_desc').focusout(function () {
        if (Metamaps.Create.newSynapse.beingCreated) {
          Metamaps.Synapse.createSynapseLocally()
        }
      })

      $('#synapse_desc').bind('typeahead:select', function (event, datum, dataset) {
        if (datum.id) { // if they clicked on an existing synapse get it
          Metamaps.Synapse.getSynapseFromAutocomplete(datum.id)
        } else {
          Metamaps.Create.newSynapse.description = datum.value
          Metamaps.Synapse.createSynapseLocally()
        }
      })
    },
    beingCreated: false,
    description: null,
    topic1id: null,
    topic2id: null,
    newSynapseId: null,
    open: function () {
      $('#new_synapse').fadeIn(100, function () {
        $('#synapse_desc').focus()
      })
      Metamaps.Create.newSynapse.beingCreated = true
    },
    hide: function () {
      $('#new_synapse').fadeOut('fast')
      $('#synapse_desc').typeahead('val', '')
      Metamaps.Create.newSynapse.beingCreated = false
      Metamaps.Create.newTopic.addSynapse = false
      Metamaps.Create.newSynapse.topic1id = 0
      Metamaps.Create.newSynapse.topic2id = 0
      Metamaps.Mouse.synapseStartCoordinates = []
      Metamaps.Visualize.mGraph.plot()
    },
  }
}; // end Metamaps.Create

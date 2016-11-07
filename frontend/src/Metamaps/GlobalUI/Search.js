/* global $, Hogan, Bloodhound, CanvasLoader */

import Active from '../Active'
import Router from '../Router'

const Search = {
  locked: false,
  isOpen: false,
  limitTopicsToMe: false,
  limitMapsToMe: false,
  changing: false,
  optionsInitialized: false,
  init: function(serverData) {
    var self = Search

    self.wildcardIconUrl = serverData['icons/wildcard.png']
    self.userIconUrl = serverData['user.png']

    // this is similar to Metamaps.Loading, but it's for the search element
    var loader = new CanvasLoader('searchLoading')
    loader.setColor('#4fb5c0') // default is '#000000'
    loader.setDiameter(24) // default is 40
    loader.setDensity(41) // default is 40
    loader.setRange(0.9) // default is 1.3
    loader.show() // Hidden by default

    $('.sidebarSearchIcon').click(function(e) {
      $('.sidebarSearchField').focus()
    })
    $('.sidebarSearch').click(function(e) {
      e.stopPropagation()
    })

    self.startTypeahead()
  },
  focus: function() {
    $('.sidebarSearchField').focus()
  },
  startTypeahead: function() {
    var self = Search

    var mapheader = Active.Mapper ? '<div class="searchMapsHeader searchHeader"><h3 class="search-heading">Maps</h3><input type="checkbox" class="limitToMe" id="limitMapsToMe"></input><label for="limitMapsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div></div>' : '<div class="searchMapsHeader searchHeader"><h3 class="search-heading">Maps</h3><div class="minimizeResults minimizeMapResults"></div><div class="clearfloat"></div></div>'
    var topicheader = Active.Mapper ? '<div class="searchTopicsHeader searchHeader"><h3 class="search-heading">Topics</h3><input type="checkbox" class="limitToMe" id="limitTopicsToMe"></input><label for="limitTopicsToMe" class="limitToMeLabel">added by me</label><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div></div>' : '<div class="searchTopicsHeader searchHeader"><h3 class="search-heading">Topics</h3><div class="minimizeResults minimizeTopicResults"></div><div class="clearfloat"></div></div>'
    var mapperheader = '<div class="searchMappersHeader searchHeader"><h3 class="search-heading">Mappers</h3><div class="minimizeResults minimizeMapperResults"></div><div class="clearfloat"></div></div>'

    var topics = {
      name: 'topics',
      limit: 9999,

      display: s => s.label,
      templates: {
        notFound: function(s) {
          return Hogan.compile(topicheader + $('#topicSearchTemplate').html()).render({
            value: 'No results',
            label: 'No results',
            typeImageURL: self.wildcardIconUrl,
            rtype: 'noresult'
          })
        },
        header: topicheader,
        suggestion: function(s) {
          return Hogan.compile($('#topicSearchTemplate').html()).render(s)
        }
      },
      source: new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/search/topics',
          prepare: function(query, settings) {
            settings.url += '?term=' + query
            if (Active.Mapper && self.limitTopicsToMe) {
              settings.url += '&user=' + Active.Mapper.id.toString()
            }
            return settings
          }
        }
      })
    }

    var maps = {
      name: 'maps',
      limit: 9999,
      display: s => s.label,
      templates: {
        notFound: function(s) {
          return Hogan.compile(mapheader + $('#mapSearchTemplate').html()).render({
            value: 'No results',
            label: 'No results',
            rtype: 'noresult'
          })
        },
        header: mapheader,
        suggestion: function(s) {
          return Hogan.compile($('#mapSearchTemplate').html()).render(s)
        }
      },
      source: new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: '/search/maps',
          prepare: function(query, settings) {
            settings.url += '?term=' + query
            if (Active.Mapper && self.limitMapsToMe) {
              settings.url += '&user=' + Active.Mapper.id.toString()
            }
            return settings
          }
        }
      })
    }

    var mappers = {
      name: 'mappers',
      limit: 9999,
      display: s => s.label,
      templates: {
        notFound: function(s) {
          return Hogan.compile(mapperheader + $('#mapperSearchTemplate').html()).render({
            value: 'No results',
            label: 'No results',
            rtype: 'noresult',
            profile: self.userIconUrl
          })
        },
        header: mapperheader,
        suggestion: function(s) {
          return Hogan.compile($('#mapperSearchTemplate').html()).render(s)
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

    // Take all that crazy setup data and put it together into one beautiful typeahead call!
    $('.sidebarSearchField').typeahead(
      {
        highlight: true
      },
      [topics, maps, mappers]
    )

    // Set max height of the search results box to prevent it from covering bottom left footer
    $('.sidebarSearchField').bind('typeahead:render', function(event) {
      self.initSearchOptions()
      self.hideLoader()
      var h = $(window).height()
      $('.tt-dropdown-menu').css('max-height', h - 100)
      if (self.limitTopicsToMe) {
        $('#limitTopicsToMe').prop('checked', true)
      }
      if (self.limitMapsToMe) {
        $('#limitMapsToMe').prop('checked', true)
      }
    })
    $(window).resize(function() {
      var h = $(window).height()
      $('.tt-dropdown-menu').css('max-height', h - 100)
    })

    // tell the autocomplete to launch a new tab with the topic, map, or mapper you clicked on
    $('.sidebarSearchField').bind('typeahead:select', self.handleResultClick)

    // don't do it, if they clicked on a 'addToMap' button
    $('.sidebarSearch button.addToMap').click(function(event) {
      event.stopPropagation()
    })

    // make sure that when you click on 'limit to me' or 'toggle section' it works
    $('.sidebarSearchField.tt-input').keyup(function() {
      if ($('.sidebarSearchField.tt-input').val() === '') {
        self.hideLoader()
      } else {
        self.showLoader()
      }
    })
  },
  handleResultClick: function(event, datum, dataset) {
    var self = Search

    self.hideLoader()

    if (['topic', 'map', 'mapper'].indexOf(datum.rtype) !== -1) {
      if (datum.rtype === 'topic') {
        Router.topics(datum.id)
      } else if (datum.rtype === 'map') {
        Router.maps(datum.id)
      } else if (datum.rtype === 'mapper') {
        Router.explore('mapper', datum.id)
      }
    }
  },
  initSearchOptions: function() {
    var self = Search

    function toggleResultSet(set) {
      var s = $('.tt-dataset-' + set + ' .tt-suggestion, .tt-dataset-' + set + ' .resultnoresult')
      if (s.is(':visible')) {
        s.hide()
        $(this).removeClass('minimizeResults').addClass('maximizeResults')
      } else {
        s.show()
        $(this).removeClass('maximizeResults').addClass('minimizeResults')
      }
    }

    $('.limitToMe').unbind().bind('change', function(e) {
      if ($(this).attr('id') === 'limitTopicsToMe') {
        self.limitTopicsToMe = !self.limitTopicsToMe
      }
      if ($(this).attr('id') === 'limitMapsToMe') {
        self.limitMapsToMe = !self.limitMapsToMe
      }

      // set the value of the search equal to itself to retrigger the
      // autocomplete event
      var searchQuery = $('.sidebarSearchField.tt-input').val()
      $('.sidebarSearchField').typeahead('val', '')
        .typeahead('val', searchQuery)
    })

    // when the user clicks minimize section, hide the results for that section
    $('.minimizeMapperResults').unbind().click(function(e) {
      toggleResultSet.call(this, 'mappers')
    })
    $('.minimizeTopicResults').unbind().click(function(e) {
      toggleResultSet.call(this, 'topics')
    })
    $('.minimizeMapResults').unbind().click(function(e) {
      toggleResultSet.call(this, 'maps')
    })
  },
  hideLoader: function() {
    $('#searchLoading').hide()
  },
  showLoader: function() {
    $('#searchLoading').show()
  }
}

export default Search

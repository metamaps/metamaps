/* global Metamaps, $ */

import outdent from 'outdent'

import Active from '../Active'
import AutoLayout from '../AutoLayout'
import Create from '../Create'
import Filter from '../Filter'
import GlobalUI from '../GlobalUI'
import JIT from '../JIT'
import Realtime from '../Realtime'
import Router from '../Router'
import Selected from '../Selected'
import SynapseCard from '../SynapseCard'
import TopicCard from '../TopicCard'
import Visualize from '../Visualize'

import CheatSheet from './CheatSheet'
import InfoBox from './InfoBox'

/*
 * Metamaps.Map.js.erb
 *
 * Dependencies:
 *  - Metamaps.Backbone
 *  - Metamaps.Erb
 *  - Metamaps.Loading
 *  - Metamaps.Mappers
 *  - Metamaps.Mappings
 *  - Metamaps.Maps
 *  - Metamaps.Messages
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 */

const Map = {
  events: {
    editedByActiveMapper: 'Metamaps:Map:events:editedByActiveMapper'
  },
  init: function () {
    var self = Map

    // prevent right clicks on the main canvas, so as to not get in the way of our right clicks
    $('#wrapper').on('contextmenu', function (e) {
      return false
    })

    $('.starMap').click(function () {
      if ($(this).is('.starred')) self.unstar()
      else self.star()
    })

    $('.sidebarFork').click(function () {
      self.fork()
    })

    GlobalUI.CreateMap.emptyForkMapForm = $('#fork_map').html()

    self.updateStar()
    self.InfoBox.init()
    CheatSheet.init()

    $(document).on(Map.events.editedByActiveMapper, self.editedByActiveMapper)
  },
  launch: function (id) {
    var bb = Metamaps.Backbone
    var start = function (data) {
      Active.Map = new bb.Map(data.map)
      Metamaps.Mappers = new bb.MapperCollection(data.mappers)
      Metamaps.Collaborators = new bb.MapperCollection(data.collaborators)
      Metamaps.Topics = new bb.TopicCollection(data.topics)
      Metamaps.Synapses = new bb.SynapseCollection(data.synapses)
      Metamaps.Mappings = new bb.MappingCollection(data.mappings)
      Metamaps.Messages = data.messages
      Metamaps.Stars = data.stars
      Metamaps.Backbone.attachCollectionEvents()

      var map = Active.Map
      var mapper = Active.Mapper

      document.title = map.get('name') + ' | Metamaps'

      // add class to .wrapper for specifying whether you can edit the map
      if (map.authorizeToEdit(mapper)) {
        $('.wrapper').addClass('canEditMap')
      }

      // add class to .wrapper for specifying if the map can
      // be collaborated on
      if (map.get('permission') === 'commons') {
        $('.wrapper').addClass('commonsMap')
      }

      Map.updateStar()     

      // set filter mapper H3 text
      $('#filter_by_mapper h3').html('MAPPERS')

      // build and render the visualization
      Visualize.type = 'ForceDirected'
      JIT.prepareVizData()

      // update filters
      Filter.reset()

      // reset selected arrays
      Selected.reset()

      // set the proper mapinfobox content
      Map.InfoBox.load()

      // these three update the actual filter box with the right list items
      Filter.checkMetacodes()
      Filter.checkSynapses()
      Filter.checkMappers()

      Realtime.startActiveMap()
      Metamaps.Loading.hide()
      
      // for mobile
      $('#header_content').html(map.get('name'))
    }

    $.ajax({
      url: '/maps/' + id + '/contains.json',
      success: start
    })
  },
  end: function () {
    if (Active.Map) {
      $('.wrapper').removeClass('canEditMap commonsMap')
      AutoLayout.resetSpiral()

      $('.rightclickmenu').remove()
      TopicCard.hideCard()
      SynapseCard.hideCard()
      Create.newTopic.hide(true) // true means force (and override pinned)
      Create.newSynapse.hide()
      Filter.close()
      Map.InfoBox.close()
      Realtime.endActiveMap()
    }
  },
  updateStar: function () {
    if (!Active.Mapper || !Metamaps.Stars) return
    // update the star/unstar icon
    if (Metamaps.Stars.find(function (s) { return s.user_id === Active.Mapper.id })) {
      $('.starMap').addClass('starred')
      $('.starMap .tooltipsAbove').html('Unstar')
    } else {
      $('.starMap').removeClass('starred')
      $('.starMap .tooltipsAbove').html('Star')
    }
  },
  star: function () {
    var self = Map

    if (!Active.Map) return
    $.post('/maps/' + Active.Map.id + '/star')
    Metamaps.Stars.push({ user_id: Active.Mapper.id, map_id: Active.Map.id })
    Metamaps.Maps.Starred.add(Active.Map)
    GlobalUI.notifyUser('Map is now starred')
    self.updateStar()
  },
  unstar: function () {
    var self = Map

    if (!Active.Map) return
    $.post('/maps/' + Active.Map.id + '/unstar')
    Metamaps.Stars = Metamaps.Stars.filter(function (s) { return s.user_id != Active.Mapper.id })
    Metamaps.Maps.Starred.remove(Active.Map)
    self.updateStar() 
  },
  fork: function () {
    GlobalUI.openLightbox('forkmap')

    var nodes_data = '',
      synapses_data = ''
    var nodes_array = []
    var synapses_array = []
    // collect the unfiltered topics
    Visualize.mGraph.graph.eachNode(function (n) {
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

      var descNotFiltered = Filter.visible.synapses.indexOf(desc) > -1
      // make sure that both topics are being added, otherwise, it
      // doesn't make sense to add the synapse
      var topicsNotFiltered = nodes_array.indexOf(synapse.get('topic1_id')) > -1
      topicsNotFiltered = topicsNotFiltered && nodes_array.indexOf(synapse.get('topic2_id')) > -1
      if (descNotFiltered && topicsNotFiltered) {
        synapses_array.push(synapse.id)
      }
    })

    synapses_data = synapses_array.join()
    nodes_data = nodes_data.slice(0, -1)

    GlobalUI.CreateMap.topicsToMap = nodes_data
    GlobalUI.CreateMap.synapsesToMap = synapses_data
  },
  leavePrivateMap: function () {
    var map = Active.Map
    Metamaps.Maps.Active.remove(map)
    Metamaps.Maps.Featured.remove(map)
    Router.home()
    GlobalUI.notifyUser('Sorry! That map has been changed to Private.')
  },
  cantEditNow: function () {
    Realtime.turnOff(true); // true is for 'silence'
    GlobalUI.notifyUser('Map was changed to Public. Editing is disabled.')
    Active.Map.trigger('changeByOther')
  },
  canEditNow: function () {
    var confirmString = "You've been granted permission to edit this map. "
    confirmString += 'Do you want to reload and enable realtime collaboration?'
    var c = confirm(confirmString)
    if (c) {
      Router.maps(Active.Map.id)
    }
  },
  editedByActiveMapper: function () {
    if (Active.Mapper) {
      Metamaps.Mappers.add(Active.Mapper)
    }
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

    var mGraph = Visualize.mGraph

    var id = mGraph.root
    var root = mGraph.graph.getNode(id)
    var T = !!root.visited

    // pass true to avoid basing it on a selection
    JIT.zoomExtents(null, canvas, true)

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

    var imageData = canvas.canvas.toDataURL()

    var map = Active.Map

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

    var mapName = map.get('name').split(' ').join(['-'])
    const filename = `metamap-${map.id}-${mapName}-${today}.png`

    var downloadMessage = outdent`
      Captured map screenshot!
      <a href="${imageData.encodedImage}" download="${filename}">DOWNLOAD</a>`
    GlobalUI.notifyUser(downloadMessage)

    canvas.canvas.toBlob(imageBlob => {
      const formData = new window.FormData();
      formData.append('map[screenshot]', imageBlob, filename)
      $.ajax({
        type: 'PATCH',
        dataType: 'json',
        url: `/maps/${map.id}`,
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          console.log('successfully uploaded map screenshot')
        },
        error: function () {
          console.log('failed to save map screenshot')
        }
      })
    })
  }
}

export { CheatSheet, InfoBox }
export default Map

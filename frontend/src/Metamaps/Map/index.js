/* global $ */

import outdent from 'outdent'
import { find as _find } from 'lodash'

import Active from '../Active'
import AutoLayout from '../AutoLayout'
import Create from '../Create'
import DataModel from '../DataModel'
import DataModelMap from '../DataModel/Map'
import Filter from '../Filter'
import GlobalUI from '../GlobalUI'
import JIT from '../JIT'
import Loading from '../Loading'
import Realtime from '../Realtime'
import Router from '../Router'
import Selected from '../Selected'
import SynapseCard from '../SynapseCard'
import TopicCard from '../TopicCard'
import Visualize from '../Visualize'

import CheatSheet from './CheatSheet'
import InfoBox from './InfoBox'

const Map = {
  events: {
    editedByActiveMapper: 'Metamaps:Map:events:editedByActiveMapper'
  },
  init: function(serverData) {
    var self = Map

    $('#wrapper').mousedown(function(e) {
      if (e.button === 1) return false
    })

    $('.starMap').click(function() {
      if ($(this).is('.starred')) self.unstar()
      else self.star()
    })

    $('.sidebarFork').click(function() {
      self.fork()
    })

    GlobalUI.CreateMap.emptyForkMapForm = $('#fork_map').html()

    self.updateStar()

    InfoBox.init(serverData, function updateThumbnail() {
      self.uploadMapScreenshot()
    })
    CheatSheet.init(serverData)

    $('.viewOnly .requestAccess').click(self.requestAccess)

    $(document).on(Map.events.editedByActiveMapper, self.editedByActiveMapper)
  },
  requestAccess: function() {
    $('.viewOnly').removeClass('sendRequest').addClass('sentRequest')
    const mapId = Active.Map.id
    $.post({
      url: `/maps/${mapId}/access_request`
    })
    GlobalUI.notifyUser('Map creator will be notified of your request')
  },
  setAccessRequest: function(requests, activeMapper) {
    let className = 'isViewOnly '
    if (activeMapper) {
      const request = _find(requests, r => r.user_id === activeMapper.id)
      if (!request) className += 'sendRequest'
      else if (request && !request.answered) className += 'sentRequest'
      else if (request && request.answered && !request.approved) className += 'requestDenied'
    }
    $('.viewOnly').removeClass('sendRequest sentRequest requestDenied').addClass(className)
  },
  launch: function(id) {
    var start = function(data) {
      Active.Map = new DataModelMap(data.map)
      DataModel.Mappers = new DataModel.MapperCollection(data.mappers)
      DataModel.Collaborators = new DataModel.MapperCollection(data.collaborators)
      DataModel.Topics = new DataModel.TopicCollection(data.topics)
      DataModel.Synapses = new DataModel.SynapseCollection(data.synapses)
      DataModel.Mappings = new DataModel.MappingCollection(data.mappings)
      DataModel.Messages = data.messages
      DataModel.Stars = data.stars
      DataModel.attachCollectionEvents()

      var map = Active.Map
      var mapper = Active.Mapper

      document.title = map.get('name') + ' | Metamaps'

      // add class to .wrapper for specifying whether you can edit the map
      if (map.authorizeToEdit(mapper)) {
        $('.wrapper').addClass('canEditMap')
      } else {
        Map.setAccessRequest(data.requests, mapper)
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
      InfoBox.load()

      // these three update the actual filter box with the right list items
      Filter.checkMetacodes()
      Filter.checkSynapses()
      Filter.checkMappers()

      Realtime.startActiveMap()
      Loading.hide()

      // for mobile
      $('#header_content').html(map.get('name'))
    }

    $.ajax({
      url: '/maps/' + id + '/contains.json',
      success: start
    })
  },
  end: function() {
    if (Active.Map) {
      $('.wrapper').removeClass('canEditMap commonsMap')
      AutoLayout.resetSpiral()

      $('.rightclickmenu').remove()
      TopicCard.hideCard()
      SynapseCard.hideCard()
      Create.newTopic.hide(true) // true means force (and override pinned)
      Create.newSynapse.hide()
      Filter.close()
      InfoBox.close()
      Realtime.endActiveMap()
      $('.viewOnly').removeClass('isViewOnly')
    }
  },
  updateStar: function() {
    if (!Active.Mapper || !DataModel.Stars) return
    // update the star/unstar icon
    if (DataModel.Stars.find(function(s) { return s.user_id === Active.Mapper.id })) {
      $('.starMap').addClass('starred')
      $('.starMap .tooltipsAbove').html('Unstar')
    } else {
      $('.starMap').removeClass('starred')
      $('.starMap .tooltipsAbove').html('Star')
    }
  },
  star: function() {
    var self = Map

    if (!Active.Map) return
    $.post('/maps/' + Active.Map.id + '/star')
    DataModel.Stars.push({ user_id: Active.Mapper.id, map_id: Active.Map.id })
    DataModel.Maps.Starred.add(Active.Map)
    GlobalUI.notifyUser('Map is now starred')
    self.updateStar()
  },
  unstar: function() {
    var self = Map

    if (!Active.Map) return
    $.post('/maps/' + Active.Map.id + '/unstar')
    DataModel.Stars = DataModel.Stars.filter(function(s) { return s.user_id !== Active.Mapper.id })
    DataModel.Maps.Starred.remove(Active.Map)
    self.updateStar()
  },
  fork: function() {
    GlobalUI.openLightbox('forkmap')

    let nodesData = ''
    let synapsesData = ''
    let nodesArray = []
    let synapsesArray = []
    // collect the unfiltered topics
    Visualize.mGraph.graph.eachNode(function(n) {
      // if the opacity is less than 1 then it's filtered
      if (n.getData('alpha') === 1) {
        var id = n.getData('topic').id
        nodesArray.push(id)
        let x, y
        if (n.pos.x && n.pos.y) {
          x = n.pos.x
          y = n.pos.y
        } else {
          x = Math.cos(n.pos.theta) * n.pos.rho
          y = Math.sin(n.pos.theta) * n.pos.rho
        }
        nodesData += id + '/' + x + '/' + y + ','
      }
    })
    // collect the unfiltered synapses
    DataModel.Synapses.each(function(synapse) {
      var desc = synapse.get('desc')

      var descNotFiltered = Filter.visible.synapses.indexOf(desc) > -1
      // make sure that both topics are being added, otherwise, it
      // doesn't make sense to add the synapse
      var topicsNotFiltered = nodesArray.indexOf(synapse.get('topic1_id')) > -1
      topicsNotFiltered = topicsNotFiltered && nodesArray.indexOf(synapse.get('topic2_id')) > -1
      if (descNotFiltered && topicsNotFiltered) {
        synapsesArray.push(synapse.id)
      }
    })

    synapsesData = synapsesArray.join()
    nodesData = nodesData.slice(0, -1)

    GlobalUI.CreateMap.topicsToMap = nodesData
    GlobalUI.CreateMap.synapsesToMap = synapsesData
  },
  leavePrivateMap: function() {
    var map = Active.Map
    DataModel.Maps.Active.remove(map)
    DataModel.Maps.Featured.remove(map)
    Router.home()
    GlobalUI.notifyUser('Sorry! That map has been changed to Private.')
  },
  cantEditNow: function() {
    Realtime.turnOff(true) // true is for 'silence'
    GlobalUI.notifyUser('Map was changed to Public. Editing is disabled.')
    Active.Map.trigger('changeByOther')
  },
  canEditNow: function() {
    var confirmString = "You've been granted permission to edit this map. "
    confirmString += 'Do you want to reload and enable realtime collaboration?'
    var c = window.confirm(confirmString)
    if (c) {
      Router.maps(Active.Map.id)
    }
  },
  editedByActiveMapper: function() {
    if (Active.Mapper) {
      DataModel.Mappers.add(Active.Mapper)
    }
  },
  exportImage: function() {
    Map.uploadMapScreenshot()
    Map.offerScreenshotDownload()
    GlobalUI.notifyUser('Note: this button is going away. Check the map card or the import box for setting the map thumbnail or downloading a screenshot.')
  },
  offerScreenshotDownload: () => {
    const canvas = Map.getMapCanvasForScreenshots()
    const filename = Map.getMapScreenshotFilename(Active.Map)

    var downloadMessage = outdent`
      Captured map screenshot!
      <a id="map-screenshot-download-link"
         href="${canvas.canvas.toDataURL()}"
         download="${filename}"
      >
        DOWNLOAD
      </a>`
    GlobalUI.notifyUser(downloadMessage)
  },
  uploadMapScreenshot: () => {
    const canvas = Map.getMapCanvasForScreenshots()
    const filename = Map.getMapScreenshotFilename(Active.Map)

    canvas.canvas.toBlob(imageBlob => {
      const formData = new window.FormData()
      formData.append('map[screenshot]', imageBlob, filename)
      $.ajax({
        type: 'PATCH',
        dataType: 'json',
        url: `/maps/${Active.Map.id}`,
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
          GlobalUI.notifyUser('Successfully updated map screenshot.')
        },
        error: function() {
          GlobalUI.notifyUser('Failed to update map screenshot.')
        }
      })
    })
  },
  getMapCanvasForScreenshots: () => {
    var canvas = {}

    canvas.canvas = document.createElement('canvas')
    canvas.canvas.width = 1880 // 960
    canvas.canvas.height = 1260 // 630

    canvas.scaleOffsetX = 1
    canvas.scaleOffsetY = 1
    canvas.translateOffsetY = 0
    canvas.translateOffsetX = 0
    canvas.denySelected = true

    canvas.getSize = function() {
      if (this.size) return this.size
      var canvas = this.canvas
      this.size = {
        width: canvas.width,
        height: canvas.height
      }
      return this.size
    }
    canvas.scale = function(x, y) {
      const px = this.scaleOffsetX * x
      const py = this.scaleOffsetY * y
      const dx = this.translateOffsetX * (x - 1) / px
      const dy = this.translateOffsetY * (y - 1) / py
      this.scaleOffsetX = px
      this.scaleOffsetY = py
      this.getCtx().scale(x, y)
      this.translate(dx, dy)
    }
    canvas.translate = function(x, y) {
      const sx = this.scaleOffsetX
      const sy = this.scaleOffsetY
      this.translateOffsetX += x * sx
      this.translateOffsetY += y * sy
      this.getCtx().translate(x, y)
    }
    canvas.getCtx = function() {
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

    const c = canvas.canvas
    const ctx = canvas.getCtx()
    const scale = canvas.scaleOffsetX

    // draw a grey background
    ctx.fillStyle = '#d8d9da'
    const xPoint = (-(c.width / scale) / 2) - (canvas.translateOffsetX / scale)
    const yPoint = (-(c.height / scale) / 2) - (canvas.translateOffsetY / scale)
    ctx.fillRect(xPoint, yPoint, c.width / scale, c.height / scale)

    // draw the graph
    mGraph.graph.eachNode(function(node) {
      var nodeAlpha = node.getData('alpha')
      node.eachAdjacency(function(adj) {
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

    return canvas
  },
  getMapScreenshotFilename: map => {
    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth() + 1 // January is 0!
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
    return filename
  }
}

export { CheatSheet, InfoBox }
export default Map

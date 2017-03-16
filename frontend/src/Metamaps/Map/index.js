/* global $ */

import outdent from 'outdent'
import { find as _find } from 'lodash'
import { browserHistory } from 'react-router'

import Active from '../Active'
import AutoLayout from '../AutoLayout'
import Create from '../Create'
import DataModel from '../DataModel'
import DataModelMap from '../DataModel/Map'
import Filter from '../Filter'
import GlobalUI, { ReactApp } from '../GlobalUI'
import JIT from '../JIT'
import Loading from '../Loading'
import Realtime from '../Realtime'
import Selected from '../Selected'
import SynapseCard from '../SynapseCard'
import TopicCard from '../Views/TopicCard'
import Visualize from '../Visualize'

import CheatSheet from './CheatSheet'
import InfoBox from './InfoBox'

const Map = {
  events: {
    editedByActiveMapper: 'Metamaps:Map:events:editedByActiveMapper'
  },
  mapIsStarred: false,
  requests: [],
  userRequested: false,
  requestAnswered: false,
  requestApproved: false,
  hasLearnedTopicCreation: true,
  init: function(serverData) {
    var self = Map
    self.mapIsStarred = serverData.mapIsStarred
    self.requests = serverData.requests
    self.setAccessRequest()
    $('#wrapper').mousedown(function(e) {
      if (e.button === 1) return false
    })
    GlobalUI.CreateMap.emptyForkMapForm = $('#fork_map').html()
    InfoBox.init(serverData, function updateThumbnail() {
      self.uploadMapScreenshot()
    })
    CheatSheet.init(serverData)
    $(document).on(Map.events.editedByActiveMapper, self.editedByActiveMapper)
  },
  setHasLearnedTopicCreation: function(value) {
    const self = Map
    self.hasLearnedTopicCreation = value
    ReactApp.render()
  },
  requestAccess: function() {
    const self = Map
    self.requests.push({
      user_id: Active.Mapper.id,
      answered: false,
      approved: false
    })
    self.setAccessRequest()
    const mapId = Active.Map.id
    $.post({
      url: `/maps/${mapId}/access_request`
    })
    GlobalUI.notifyUser('Map creator will be notified of your request')
  },
  setAccessRequest: function() {
    const self = Map
    if (Active.Mapper) {
      const request = _find(self.requests, r => r.user_id === Active.Mapper.id)
      if (!request) {
        self.userRequested = false
        self.requestAnswered = false
        self.requestApproved = false
      }
      else if (request && !request.answered) {
        self.userRequested = true
        self.requestAnswered = false
        self.requestApproved = false
      }
      else if (request && request.answered && !request.approved) {
        self.userRequested = true
        self.requestAnswered = true
        self.requestApproved = false
      }
    }
    ReactApp.render()
  },
  launch: function(id) {
    const self = Map
    var dataIsReadySetupMap = function() {
      Map.setAccessRequest()
      Visualize.type = 'ForceDirected'
      JIT.prepareVizData()
      Selected.reset()
      InfoBox.load()
      Filter.reset()
      Filter.checkMetacodes()
      Filter.checkSynapses()
      Filter.checkMappers()
      Realtime.startActiveMap()
      Loading.hide()
      document.title = Active.Map.get('name') + ' | Metamaps'
      ReactApp.mobileTitle = Active.Map.get('name')
      ReactApp.render()
    }
    function isLoaded() {
      if (InfoBox.generateBoxHTML) dataIsReadySetupMap()
      else setTimeout(() => isLoaded(), 50)
    }
    if (Active.Map && Active.Map.id === id) {
      isLoaded()
    }
    else {
      Loading.show()
      $.ajax({
        url: '/maps/' + id + '/contains.json',
        success: function(data) {
          Active.Map = new DataModelMap(data.map)
          DataModel.Mappers = new DataModel.MapperCollection(data.mappers)
          DataModel.Collaborators = new DataModel.MapperCollection(data.collaborators)
          DataModel.Topics = new DataModel.TopicCollection(data.topics)
          DataModel.Synapses = new DataModel.SynapseCollection(data.synapses)
          DataModel.Mappings = new DataModel.MappingCollection(data.mappings)
          DataModel.Messages = data.messages
          DataModel.Stars = data.stars
          DataModel.attachCollectionEvents()
          self.requests = data.requests
          isLoaded()
        }
      })
    }
  },
  end: function() {
    if (Active.Map) {
      $('.main').removeClass('compressed')
      AutoLayout.resetSpiral()
      $('.rightclickmenu').remove()
      TopicCard.hideCard()
      SynapseCard.hideCard()
      Create.newTopic.hide(true) // true means force (and override pinned)
      Create.newSynapse.hide()
      InfoBox.close()
      Realtime.endActiveMap()
      self.requests = []
      self.hasLearnedTopicCreation = true
    }
  },
  star: function() {
    var self = Map

    if (!Active.Map) return
    $.post('/maps/' + Active.Map.id + '/star')
    DataModel.Stars.push({ user_id: Active.Mapper.id, map_id: Active.Map.id })
    DataModel.Maps.Starred.add(Active.Map)
    GlobalUI.notifyUser('Map is now starred')
    self.mapIsStarred = true
    ReactApp.render()
  },
  unstar: function() {
    var self = Map

    if (!Active.Map) return
    $.post('/maps/' + Active.Map.id + '/unstar')
    DataModel.Stars = DataModel.Stars.filter(function(s) { return s.user_id !== Active.Mapper.id })
    DataModel.Maps.Starred.remove(Active.Map)
    self.mapIsStarred = false
    ReactApp.render()
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
    browserHistory.push('/')
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
      window.location.reload()
    }
  },
  editedByActiveMapper: function() {
    if (Active.Mapper) {
      DataModel.Mappers.add(Active.Mapper)
    }
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

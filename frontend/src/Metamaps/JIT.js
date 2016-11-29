/* global $, Image, CanvasLoader */

import _ from 'lodash'
import outdent from 'outdent'

import $jit from '../patched/JIT'

import Active from './Active'
import Control from './Control'
import Create from './Create'
import DataModel from './DataModel'
import Filter from './Filter'
import GlobalUI from './GlobalUI'
import Map from './Map'
import Mouse from './Mouse'
import Selected from './Selected'
import Settings from './Settings'
import Synapse from './Synapse'
import SynapseCard from './SynapseCard'
import Topic from './Topic'
import TopicCard from './TopicCard'
import Util from './Util'
import Visualize from './Visualize'
import clipboard from 'clipboard-js'

let panningInt

const JIT = {
  tempInit: false,
  tempNode: null,
  tempNode2: null,
  mouseDownPix: {},
  dragFlag: 0,
  dragTolerance: 0,
  virtualPointer: {},

  events: {
    topicDrag: 'Metamaps:JIT:events:topicDrag',
    newTopic: 'Metamaps:JIT:events:newTopic',
    deleteTopic: 'Metamaps:JIT:events:deleteTopic',
    removeTopic: 'Metamaps:JIT:events:removeTopic',
    newSynapse: 'Metamaps:JIT:events:newSynapse',
    deleteSynapse: 'Metamaps:JIT:events:deleteSynapse',
    removeSynapse: 'Metamaps:JIT:events:removeSynapse',
    pan: 'Metamaps:JIT:events:pan',
    zoom: 'Metamaps:JIT:events:zoom',
    animationDone: 'Metamaps:JIT:events:animationDone'
  },
  vizData: [], // contains the visualization-compatible graph
  /**
   * This method will bind the event handlers it is interested and initialize the class.
   */
  init: function(serverData) {
    const self = JIT

    $('.zoomIn').click(self.zoomIn)
    $('.zoomOut').click(self.zoomOut)

    const zoomExtents = function(event) {
      self.zoomExtents(event, Visualize.mGraph.canvas)
    }
    $('.zoomExtents').click(zoomExtents)

    $('.takeScreenshot').click(Map.exportImage)

    self.topicDescImage = new Image()
    self.topicDescImage.src = serverData['topic_description_signifier.png']

    self.topicLinkImage = new Image()
    self.topicLinkImage.src = serverData['topic_link_signifier.png']
  },
  /**
   * convert our topic JSON into something JIT can use
   */
  convertModelsToJIT: function(topics, synapses) {
    const jitReady = []

    const synapsesToRemove = []
    let mapping
    let node
    const nodes = {}
    let existingEdge
    let edge
    const edges = []

    topics.each(function(t) {
      node = t.createNode()
      nodes[node.id] = node
    })
    synapses.each(function(s) {
      edge = s.createEdge()

      if (topics.get(s.get('topic1_id')) === undefined || topics.get(s.get('topic2_id')) === undefined) {
        // this means it's an invalid synapse
        synapsesToRemove.push(s)
      } else if (nodes[edge.nodeFrom] && nodes[edge.nodeTo]) {
        existingEdge = _.find(edges, {
          nodeFrom: edge.nodeFrom,
          nodeTo: edge.nodeTo
        }) ||
        _.find(edges, {
          nodeFrom: edge.nodeTo,
          nodeTo: edge.nodeFrom
        })

        if (existingEdge) {
          // for when you're dealing with multiple relationships between the same two topics
          if (Active.Map) {
            mapping = s.getMapping()
            existingEdge.data['$mappingIDs'].push(mapping.id)
          }
          existingEdge.data['$synapseIDs'].push(s.id)
        } else {
          // for when you're dealing with a topic that has relationships to many different nodes
          nodes[edge.nodeFrom].adjacencies.push(edge)
          edges.push(edge)
        }
      }
    })

    _.each(nodes, function(node) {
      jitReady.push(node)
    })

    return [jitReady, synapsesToRemove]
  },
  prepareVizData: function() {
    const self = JIT
    let mapping

    // reset/empty vizData
    self.vizData = []
    Visualize.loadLater = false

    const results = self.convertModelsToJIT(DataModel.Topics, DataModel.Synapses)

    self.vizData = results[0]

    // clean up the synapses array in case of any faulty data
    _.each(results[1], function(synapse) {
      mapping = synapse.getMapping()
      DataModel.Synapses.remove(synapse)
      if (DataModel.Mappings) DataModel.Mappings.remove(mapping)
    })

    // set up addTopic instructions in case they delete all the topics
    // i.e. if there are 0 topics at any time, it should have instructions again
    $('#instructions div').hide()
    if (Active.Map && Active.Map.authorizeToEdit(Active.Mapper)) {
      $('#instructions div.addTopic').show()
    }

    if (self.vizData.length === 0) {
      GlobalUI.showDiv('#instructions')
      Visualize.loadLater = true
    } else {
      GlobalUI.hideDiv('#instructions')
    }

    Visualize.render()
  }, // prepareVizData
  edgeRender: function(adj, canvas) {
    // get nodes cartesian coordinates
    const pos = adj.nodeFrom.pos.getc(true)
    const posChild = adj.nodeTo.pos.getc(true)

    let synapse
    if (adj.getData('displayIndex')) {
      synapse = adj.getData('synapses')[adj.getData('displayIndex')]
      if (!synapse) {
        delete adj.data.$displayIndex
        synapse = adj.getData('synapses')[0]
      }
    } else {
      synapse = adj.getData('synapses')[0]
    }

    if (!synapse) return // this means there are no corresponding synapses for
    // this edge, don't render it

    // label placement on edges
    if (canvas.denySelected) {
      const color = Settings.colors.synapses.normal
      canvas.getCtx().fillStyle = canvas.getCtx().strokeStyle = color
    }
    JIT.renderEdgeArrows($jit.Graph.Plot.edgeHelper, adj, synapse, canvas)

    // check for edge label in data
    let desc = synapse.get('desc')

    const showDesc = adj.getData('showDesc')

    const drawSynapseCount = function(context, x, y, count) {
      /*
      circle size: 16x16px
      positioning: overlay and center on top right corner of synapse label - 8px left and 8px down
      color: #dab539
      border color: #424242
      border size: 1.5px
      font: DIN medium
      font-size: 14pt
      font-color: #424242
      */
      context.beginPath()
      context.arc(x, y, 8, 0, 2 * Math.PI, false)
      context.fillStyle = '#DAB539'
      context.strokeStyle = '#424242'
      context.lineWidth = 1.5
      context.closePath()
      context.fill()
      context.stroke()

      // add the synapse count
      context.fillStyle = '#424242'
      context.textAlign = 'center'
      context.font = '14px din-medium'

      context.fillText(count, x, y + 5)
    }

    if (!canvas.denySelected && desc !== '' && showDesc) {
      // '&amp;' to '&'
      desc = Util.decodeEntities(desc)

      // now adjust the label placement
      const ctx = canvas.getCtx()
      ctx.font = 'bold 14px arial'
      ctx.fillStyle = '#FFF'
      ctx.textBaseline = 'alphabetic'

      const arrayOfLabelLines = Util.splitLine(desc, 25).split('\n')
      let lineWidths = []
      for (let index = 0; index < arrayOfLabelLines.length; ++index) {
        lineWidths.push(ctx.measureText(arrayOfLabelLines[index]).width)
      }
      const width = Math.max.apply(null, lineWidths) + 16
      const height = (16 * arrayOfLabelLines.length) + 8

      const x = (pos.x + posChild.x - width) / 2
      const y = ((pos.y + posChild.y) / 2) - height / 2

      const radius = 5

      // render background
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fill()

      // get number of synapses
      const synapseNum = adj.getData('synapses').length

      // render text
      ctx.fillStyle = '#424242'
      ctx.textAlign = 'center'
      for (let index = 0; index < arrayOfLabelLines.length; ++index) {
        ctx.fillText(arrayOfLabelLines[index], x + (width / 2), y + 18 + (16 * index))
      }

      if (synapseNum > 1) {
        drawSynapseCount(ctx, x + width, y, synapseNum)
      }
    } else if (!canvas.denySelected && showDesc) {
      // get number of synapses
      const synapseNum = adj.getData('synapses').length

      if (synapseNum > 1) {
        const ctx = canvas.getCtx()
        const x = (pos.x + posChild.x) / 2
        const y = (pos.y + posChild.y) / 2
        drawSynapseCount(ctx, x, y, synapseNum)
      }
    }
  }, // edgeRender
  ForceDirected: {
    animateSavedLayout: {
      modes: ['linear'],
      // TODO fix tests so we don't need _.get
      transition: _.get($jit, 'Trans.Quad.easeInOut'),
      duration: 800,
      onComplete: function() {
        Visualize.mGraph.busy = false
        $(document).trigger(JIT.events.animationDone)
      }
    },
    animateFDLayout: {
      modes: ['linear'],
      // TODO fix tests so we don't need _.get
      transition: _.get($jit, 'Trans.Elastic.easeOut'),
      duration: 800,
      onComplete: function() {
        Visualize.mGraph.busy = false
      }
    },
    graphSettings: {
      // id of the visualization container
      injectInto: 'infovis',
      // Enable zooming and panning
      // by scrolling and DnD
      Navigation: {
        enable: true,
        // Enable panning events only if we're dragging the empty
        // canvas (and not a node).
        panning: 'avoid nodes',
        zooming: 28 // zoom speed. higher is more sensible
      },
      // Change node and edge styles such as
      // color and width.
      // These properties are also set per node
      // with dollar prefixed data-properties in the
      // JSON structure.
      Node: {
        overridable: true,
        color: '#2D6A5D',
        type: 'customNode',
        dim: 25
      },
      Edge: {
        overridable: true,
        color: Settings.colors.synapses.normal,
        type: 'customEdge',
        lineWidth: 2,
        alpha: 1
      },
      // Native canvas text styling
      Label: {
        type: 'Native', // Native or HTML
        size: 20,
        family: 'arial',
        textBaseline: 'alphabetic',
        color: Settings.colors.labels.text
      },
      // Add Tips
      Tips: {
        enable: false,
        onShow: function(tip, node) {}
      },
      // Add node events
      Events: {
        enable: true,
        enableForEdges: true,
        onMouseMove: function(node, eventInfo, e) {
          JIT.onMouseMoveHandler(node, eventInfo, e)
        // console.log('called mouse move handler')
        },
        // Update node positions when dragged
        onDragMove: function(node, eventInfo, e) {
          JIT.onDragMoveTopicHandler(node, eventInfo, e)
        // console.log('called drag move handler')
        },
        onDragEnd: function(node, eventInfo, e) {
          JIT.onDragEndTopicHandler(node, eventInfo, e, false)
        // console.log('called drag end handler')
        },
        onDragCancel: function(node, eventInfo, e) {
          JIT.onDragCancelHandler(node, eventInfo, e, false)
        },
        // Implement the same handler for touchscreens
        onTouchStart: function(node, eventInfo, e) {},
        // Implement the same handler for touchscreens
        onTouchMove: function(node, eventInfo, e) {
          JIT.onDragMoveTopicHandler(node, eventInfo, e)
        },
        // Implement the same handler for touchscreens
        onTouchEnd: function(node, eventInfo, e) {},
        // Implement the same handler for touchscreens
        onTouchCancel: function(node, eventInfo, e) {},
        // Add also a click handler to nodes
        onClick: function(node, eventInfo, e) {
          // remove the rightclickmenu
          $('.rightclickmenu').remove()

          if (Mouse.boxStartCoordinates) {
            if (e.ctrlKey) {
              Visualize.mGraph.busy = false
              Mouse.boxEndCoordinates = eventInfo.getPos()

              const bS = Mouse.boxStartCoordinates
              const bE = Mouse.boxEndCoordinates
              if (Math.abs(bS.x - bE.x) > 20 && Math.abs(bS.y - bE.y) > 20) {
                JIT.zoomToBox(e)
                return
              } else {
                Mouse.boxStartCoordinates = null
                Mouse.boxEndCoordinates = null
              }
            }

            if (e.shiftKey) {
              Visualize.mGraph.busy = false
              Mouse.boxEndCoordinates = eventInfo.getPos()
              JIT.selectWithBox(e)

              return
            }
          }

          if (e.target.id !== 'infovis-canvas') return false

          // clicking on a edge, node, or clicking on blank part of canvas?
          if (node.nodeFrom) {
            JIT.selectEdgeOnClickHandler(node, e)
          } else if (node && !node.nodeFrom) {
            JIT.selectNodeOnClickHandler(node, e)
          } else {
            JIT.canvasClickHandler(eventInfo.getPos(), e)
          } // if
        },
        // Add also a click handler to nodes
        onRightClick: function(node, eventInfo, e) {
          // remove the rightclickmenu
          $('.rightclickmenu').remove()

          if (Mouse.boxStartCoordinates) {
            Visualize.mGraph.busy = false
            Mouse.boxEndCoordinates = eventInfo.getPos()
            JIT.selectWithBox(e)
            return
          }

          if (e.target.id !== 'infovis-canvas') return false

          // clicking on a edge, node, or clicking on blank part of canvas?
          if (node.nodeFrom) {
            JIT.selectEdgeOnRightClickHandler(node, e)
          } else if (node && !node.nodeFrom) {
            JIT.selectNodeOnRightClickHandler(node, e)
          } else {
            // console.log('right clicked on open space')
          }
        }
      },
      // Number of iterations for the FD algorithm
      iterations: 200,
      // Edge length
      levelDistance: 200
    },
    nodeSettings: {
      'customNode': {
        'render': function(node, canvas) {
          const pos = node.pos.getc(true)
          const dim = node.getData('dim')
          const topic = node.getData('topic')
          const metacode = topic ? topic.getMetacode() : false
          const ctx = canvas.getCtx()

          // if the topic is selected draw a circle around it
          if (!canvas.denySelected && node.selected) {
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, dim + 3, 0, 2 * Math.PI, false)
            ctx.strokeStyle = Settings.colors.topics.selected
            ctx.lineWidth = 2
            ctx.stroke()
          }

          if (!metacode ||
            !metacode.get('image') ||
            !metacode.get('image').complete ||
            (typeof metacode.get('image').naturalWidth !== 'undefined' &&
            metacode.get('image').naturalWidth === 0)) {
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, dim, 0, 2 * Math.PI, false)
            ctx.fillStyle = '#B6B2FD'
            ctx.fill()
          } else {
            ctx.drawImage(metacode.get('image'), pos.x - dim, pos.y - dim, dim * 2, dim * 2)
          }

          // if the topic has a link, draw a small image to indicate that
          const hasLink = topic && topic.get('link') !== '' && topic.get('link') !== null
          const linkImage = JIT.topicLinkImage
          const linkImageLoaded = linkImage.complete ||
          (typeof linkImage.naturalWidth !== 'undefined' &&
          linkImage.naturalWidth !== 0)
          if (hasLink && linkImageLoaded) {
            ctx.drawImage(linkImage, pos.x - dim - 8, pos.y - dim - 8, 16, 16)
          }

          // if the topic has a desc, draw a small image to indicate that
          const hasDesc = topic && topic.get('desc') !== '' && topic.get('desc') !== null
          const descImage = JIT.topicDescImage
          const descImageLoaded = descImage.complete ||
          (typeof descImage.naturalWidth !== 'undefined' &&
          descImage.naturalWidth !== 0)
          if (hasDesc && descImageLoaded) {
            ctx.drawImage(descImage, pos.x + dim - 8, pos.y - dim - 8, 16, 16)
          }
        },
        'contains': function(node, pos) {
          const npos = node.pos.getc(true)
          const dim = node.getData('dim')
          const arrayOfLabelLines = Util.splitLine(node.name, 25).split('\n')
          const ctx = Visualize.mGraph.canvas.getCtx()

          const height = 25 * arrayOfLabelLines.length

          let lineWidths = []
          for (let index = 0; index < arrayOfLabelLines.length; ++index) {
            lineWidths.push(ctx.measureText(arrayOfLabelLines[index]).width)
          }
          const width = Math.max.apply(null, lineWidths) + 8
          const labely = npos.y + node.getData('height') + 5 + height / 2

          const overLabel = this.nodeHelper.rectangle.contains({
            x: npos.x,
            y: labely
          }, pos, width, height)

          return this.nodeHelper.circle.contains(npos, pos, dim) || overLabel
        }
      }
    },
    edgeSettings: {
      'customEdge': {
        'render': function(adj, canvas) {
          JIT.edgeRender(adj, canvas)
        },
        'contains': function(adj, pos) {
          const from = adj.nodeFrom.pos.getc()
          const to = adj.nodeTo.pos.getc()

          // this fixes an issue where when edges are perfectly horizontal or perfectly vertical
          // it becomes incredibly difficult to hover over them
          if (-1 < pos.x && pos.x < 1) pos.x = 0
          if (-1 < pos.y && pos.y < 1) pos.y = 0

          return $jit.Graph.Plot.edgeHelper.line.contains(from, to, pos, adj.Edge.epsilon + 5)
        }
      }
    }
  }, // ForceDirected
  ForceDirected3D: {
    animate: {
      modes: ['linear'],
      // TODO fix tests so we don't need _.get
      transition: _.get($jit, 'Trans.Elastic.easeOut'),
      duration: 2500,
      onComplete: function() {
        Visualize.mGraph.busy = false
      }
    },
    graphSettings: {
      // id of the visualization container
      injectInto: 'infovis',
      type: '3D',
      Scene: {
        Lighting: {
          enable: false,
          ambient: [0.5, 0.5, 0.5],
          directional: {
            direction: {
              x: 1,
              y: 0,
              z: -1
            },
            color: [0.9, 0.9, 0.9]
          }
        }
      },
      // Enable zooming and panning
      // by scrolling and DnD
      Navigation: {
        enable: false,
        // Enable panning events only if we're dragging the empty
        // canvas (and not a node).
        panning: 'avoid nodes',
        zooming: 10 // zoom speed. higher is more sensible
      },
      // Change node and edge styles such as
      // color and width.
      // These properties are also set per node
      // with dollar prefixed data-properties in the
      // JSON structure.
      Node: {
        overridable: true,
        type: 'sphere',
        dim: 15,
        color: '#ffffff'
      },
      Edge: {
        overridable: false,
        type: 'tube',
        color: '#111',
        lineWidth: 3
      },
      // Native canvas text styling
      Label: {
        type: 'HTML', // Native or HTML
        size: 10,
        style: 'bold'
      },
      // Add node events
      Events: {
        enable: true,
        type: 'Native',
        i: 0,
        onMouseMove: function(node, eventInfo, e) {
          // if(this.i++ % 3) return
          const pos = eventInfo.getPos()
          Visualize.cameraPosition.x += (pos.x - Visualize.cameraPosition.x) * 0.5
          Visualize.cameraPosition.y += (-pos.y - Visualize.cameraPosition.y) * 0.5
          Visualize.mGraph.plot()
        },
        onMouseWheel: function(delta) {
          Visualize.cameraPosition.z += -delta * 20
          Visualize.mGraph.plot()
        },
        onClick: function() {}
      },
      // Number of iterations for the FD algorithm
      iterations: 200,
      // Edge length
      levelDistance: 100
    },
    nodeSettings: {

    },
    edgeSettings: {

    }
  }, // ForceDirected3D
  RGraph: {
    animate: {
      modes: ['polar'],
      duration: 800,
      onComplete: function() {
        Visualize.mGraph.busy = false
      }
    },
    // this will just be used to patch the ForceDirected graphsettings with the few things which actually differ
    background: {
      levelDistance: 200,
      numberOfCircles: 4,
      CanvasStyles: {
        strokeStyle: '#333',
        lineWidth: 1.5
      }
    },
    levelDistance: 200
  },
  onMouseEnter: function(edge) {
    const filtered = edge.getData('alpha') === 0

    // don't do anything if the edge is filtered
    // or if the canvas is animating
    if (filtered || Visualize.mGraph.busy) return

    $('canvas').css('cursor', 'pointer')
    const edgeIsSelected = Selected.Edges.indexOf(edge)
    // following if statement only executes if the edge being hovered over is not selected
    if (edgeIsSelected === -1) {
      edge.setData('showDesc', true, 'current')
    }

    edge.setDataset('end', {
      lineWidth: 4
    })
    Visualize.mGraph.fx.animate({
      modes: ['edge-property:lineWidth'],
      duration: 100
    })
    Visualize.mGraph.plot()
  }, // onMouseEnter
  onMouseLeave: function(edge) {
    if (edge.getData('alpha') === 0) return // don't do anything if the edge is filtered
    $('canvas').css('cursor', 'default')
    const edgeIsSelected = Selected.Edges.indexOf(edge)
    // following if statement only executes if the edge being hovered over is not selected
    if (edgeIsSelected === -1) {
      edge.setData('showDesc', false, 'current')
    }

    edge.setDataset('end', {
      lineWidth: 2
    })
    Visualize.mGraph.fx.animate({
      modes: ['edge-property:lineWidth'],
      duration: 100
    })
    Visualize.mGraph.plot()
  }, // onMouseLeave
  onMouseMoveHandler: function(_node, eventInfo, e) {
    const self = JIT

    if (Visualize.mGraph.busy) return

    const node = eventInfo.getNode()
    const edge = eventInfo.getEdge()

    // if we're on top of a node object, act like there aren't edges under it
    if (node !== false) {
      if (Mouse.edgeHoveringOver) {
        self.onMouseLeave(Mouse.edgeHoveringOver)
      }
      $('canvas').css('cursor', 'pointer')
      return
    }

    if (edge === false && Mouse.edgeHoveringOver !== false) {
      // mouse not on an edge, but we were on an edge previously
      self.onMouseLeave(Mouse.edgeHoveringOver)
    } else if (edge !== false && Mouse.edgeHoveringOver === false) {
      // mouse is on an edge, but there isn't a stored edge
      self.onMouseEnter(edge)
    } else if (edge !== false && Mouse.edgeHoveringOver !== edge) {
      // mouse is on an edge, but a different edge is stored
      self.onMouseLeave(Mouse.edgeHoveringOver)
      self.onMouseEnter(edge)
    }

    // could be false
    Mouse.edgeHoveringOver = edge

    if (!node && !edge) {
      $('canvas').css('cursor', 'default')
    }
  }, // onMouseMoveHandler
  enterKeyHandler: function() {
    const creatingMap = GlobalUI.lightbox
    if (creatingMap === 'newmap' || creatingMap === 'forkmap') {
      GlobalUI.CreateMap.submit()
    } else if (Create.newTopic.beingCreated) {
      Topic.createTopicLocally()
    } else if (Create.newSynapse.beingCreated) {
      Synapse.createSynapseLocally()
    }
  }, // enterKeyHandler
  escKeyHandler: function() {
    Control.deselectAllEdges()
    Control.deselectAllNodes()
  }, // escKeyHandler
  onDragMoveTopicHandler: function(node, eventInfo, e) {
    var self = JIT

    var authorized = Active.Map && Active.Map.authorizeToEdit(Active.Mapper)

    if (node && !node.nodeFrom) {
      self.handleSelectionBeforeDragging(node, e)

      const pos = eventInfo.getPos()
      const EDGE_THICKNESS = 30
      const SHIFT = 2 / Visualize.mGraph.canvas.scaleOffsetX
      const PERIOD = 5

      // self.virtualPointer = pos;

      // if it's a left click, or a touch, move the node
      if (e.touches || (e.button === 0 && !e.altKey && !e.ctrlKey && (e.buttons === 0 || e.buttons === 1 || e.buttons === undefined))) {
        const width = Visualize.mGraph.canvas.getSize().width
        const height = Visualize.mGraph.canvas.getSize().height
        const xPix = Util.coordsToPixels(Visualize.mGraph, pos).x
        const yPix = Util.coordsToPixels(Visualize.mGraph, pos).y

        if (self.dragFlag === 0) {
          self.mouseDownPix = Util.coordsToPixels(Visualize.mGraph, eventInfo.getPos())
          self.dragFlag = 1
        }

        if (Util.getDistance(Util.coordsToPixels(Visualize.mGraph, pos), self.mouseDownPix) > 2 && !self.dragTolerance) {
          self.dragTolerance = 1
        }

        if (xPix < EDGE_THICKNESS && self.dragTolerance) {
          clearInterval(self.dragLeftEdge)
          clearInterval(self.dragRightEdge)
          clearInterval(self.dragTopEdge)
          clearInterval(self.dragBottomEdge)
          self.virtualPointer = { x: Util.pixelsToCoords(Visualize.mGraph, { x: EDGE_THICKNESS, y: yPix }).x - SHIFT, y: pos.y }
          Visualize.mGraph.canvas.translate(SHIFT, 0)
          self.updateTopicPositions(node, self.virtualPointer)
          Visualize.mGraph.plot()

          self.dragLeftEdge = setInterval(function() {
            self.virtualPointer = { x: Util.pixelsToCoords(Visualize.mGraph, { x: EDGE_THICKNESS, y: yPix }).x - SHIFT, y: pos.y }
            Visualize.mGraph.canvas.translate(SHIFT, 0)
            self.updateTopicPositions(node, self.virtualPointer)
            Visualize.mGraph.plot()
          }, PERIOD)
        }
        if (width - xPix < EDGE_THICKNESS && self.dragTolerance) {
          clearInterval(self.dragLeftEdge)
          clearInterval(self.dragRightEdge)
          clearInterval(self.dragTopEdge)
          clearInterval(self.dragBottomEdge)
          self.virtualPointer = { x: Util.pixelsToCoords(Visualize.mGraph, { x: width - EDGE_THICKNESS, y: yPix }).x + SHIFT, y: pos.y }
          Visualize.mGraph.canvas.translate(-SHIFT, 0)
          self.updateTopicPositions(node, self.virtualPointer)
          Visualize.mGraph.plot()

          self.dragRightEdge = setInterval(function() {
            self.virtualPointer = { x: Util.pixelsToCoords(Visualize.mGraph, { x: width - EDGE_THICKNESS, y: yPix }).x + SHIFT, y: pos.y }
            Visualize.mGraph.canvas.translate(-SHIFT, 0)
            self.updateTopicPositions(node, self.virtualPointer)
            Visualize.mGraph.plot()
          }, PERIOD)
        }
        if (yPix < EDGE_THICKNESS && self.dragTolerance) {
          clearInterval(self.dragLeftEdge)
          clearInterval(self.dragRightEdge)
          clearInterval(self.dragTopEdge)
          clearInterval(self.dragBottomEdge)
          self.virtualPointer = { x: pos.x, y: Util.pixelsToCoords(Visualize.mGraph, { x: xPix, y: EDGE_THICKNESS }).y - SHIFT }
          Visualize.mGraph.canvas.translate(0, SHIFT)
          self.updateTopicPositions(node, self.virtualPointer)
          Visualize.mGraph.plot()

          self.dragTopEdge = setInterval(function() {
            self.virtualPointer = { x: pos.x, y: Util.pixelsToCoords(Visualize.mGraph, { x: xPix, y: EDGE_THICKNESS }).y - SHIFT }
            Visualize.mGraph.canvas.translate(0, SHIFT)
            self.updateTopicPositions(node, self.virtualPointer)
            Visualize.mGraph.plot()
          }, PERIOD)
        }
        if (height - yPix < EDGE_THICKNESS && self.dragTolerance) {
          clearInterval(self.dragLeftEdge)
          clearInterval(self.dragRightEdge)
          clearInterval(self.dragTopEdge)
          clearInterval(self.dragBottomEdge)
          self.virtualPointer = { x: pos.x, y: Util.pixelsToCoords(Visualize.mGraph, { x: xPix, y: height - EDGE_THICKNESS }).y + SHIFT }
          Visualize.mGraph.canvas.translate(0, -SHIFT)
          self.updateTopicPositions(node, self.virtualPointer)
          Visualize.mGraph.plot()

          self.dragBottomEdge = setInterval(function() {
            self.virtualPointer = { x: pos.x, y: Util.pixelsToCoords(Visualize.mGraph, { x: xPix, y: height - EDGE_THICKNESS }).y + SHIFT }
            Visualize.mGraph.canvas.translate(0, -SHIFT)
            self.updateTopicPositions(node, self.virtualPointer)
            Visualize.mGraph.plot()
          }, PERIOD)
        }

        if (xPix >= EDGE_THICKNESS && width - xPix >= EDGE_THICKNESS && yPix >= EDGE_THICKNESS && height - yPix >= EDGE_THICKNESS) {
          clearInterval(self.dragLeftEdge)
          clearInterval(self.dragRightEdge)
          clearInterval(self.dragTopEdge)
          clearInterval(self.dragBottomEdge)

          self.updateTopicPositions(node, pos)
          Visualize.mGraph.plot()
        }
      } else if ((e.button === 2 || (e.button === 0 && e.altKey) || e.buttons === 2) && authorized) {
        // if it's a right click or holding down alt, start synapse creation  ->third option is for firefox
        if (JIT.tempInit === false) {
          JIT.tempNode = node
          JIT.tempInit = true

          Create.newTopic.hide()
          Create.newSynapse.hide()
          // set the draw synapse start positions
          var l = Selected.Nodes.length
          if (l > 0) {
            for (let i = l - 1; i >= 0; i -= 1) {
              const n = Selected.Nodes[i]
              Mouse.synapseStartCoordinates.push({
                x: n.pos.getc().x,
                y: n.pos.getc().y
              })
            }
          } else {
            Mouse.synapseStartCoordinates = [{
              x: JIT.tempNode.pos.getc().x,
              y: JIT.tempNode.pos.getc().y
            }]
          }
          Mouse.synapseEndCoordinates = {
            x: pos.x,
            y: pos.y
          }
        }
        //
        let temp = eventInfo.getNode()
        if (temp !== false && temp.id !== node.id && Selected.Nodes.indexOf(temp) === -1) { // this means a Node has been returned
          JIT.tempNode2 = temp

          Mouse.synapseEndCoordinates = {
            x: JIT.tempNode2.pos.getc().x,
            y: JIT.tempNode2.pos.getc().y
          }

          // before making the highlighted one bigger, make sure all the others are regular size
          Visualize.mGraph.graph.eachNode(function(n) {
            n.setData('dim', 25, 'current')
          })
          temp.setData('dim', 35, 'current')
          Visualize.mGraph.plot()
        } else if (!temp) {
          JIT.tempNode2 = null
          Visualize.mGraph.graph.eachNode(function(n) {
            n.setData('dim', 25, 'current')
          })
          // pop up node creation :)
          var myX = e.clientX - 110
          var myY = e.clientY - 30
          $('#new_topic').css('left', myX + 'px')
          $('#new_topic').css('top', myY + 'px')
          Create.newTopic.x = eventInfo.getPos().x
          Create.newTopic.y = eventInfo.getPos().y
          Visualize.mGraph.plot()

          Mouse.synapseEndCoordinates = {
            x: pos.x,
            y: pos.y
          }
        }
      } else if ((e.button === 2 || (e.button === 0 && e.altKey) || e.buttons === 2) && Active.Topic) {
        GlobalUI.notifyUser('Cannot create in Topic view.')
      } else if ((e.button === 2 || (e.button === 0 && e.altKey) || e.buttons === 2) && !authorized) {
        GlobalUI.notifyUser('Cannot edit this map.')
      }
    }
  }, // onDragMoveTopicHandler
  onDragCancelHandler: function(node, eventInfo, e) {
    JIT.tempNode = null
    if (JIT.tempNode2) JIT.tempNode2.setData('dim', 25, 'current')
    JIT.tempNode2 = null
    JIT.tempInit = false
    // reset the draw synapse positions to false
    Mouse.synapseStartCoordinates = []
    Mouse.synapseEndCoordinates = null
    Visualize.mGraph.plot()
  }, // onDragCancelHandler
  onDragEndTopicHandler: function(node, eventInfo, e) {
    const self = JIT
    const midpoint = {}
    let pixelPos
    let mapping

    clearInterval(self.dragLeftEdge)
    clearInterval(self.dragRightEdge)
    clearInterval(self.dragTopEdge)
    clearInterval(self.dragBottomEdge)

    delete self.dragLeftEdge
    delete self.dragRightEdge
    delete self.dragTopEdge
    delete self.dragBottomEdge

    self.dragFlag = 0
    self.dragTolerance = 0

    if (JIT.tempInit && JIT.tempNode2 === null) {
      // this means you want to add a new topic, and then a synapse
      Create.newTopic.addSynapse = true
      Create.newTopic.open()
    } else if (JIT.tempInit && JIT.tempNode2 !== null) {
      // this means you want to create a synapse between two existing topics
      Create.newTopic.addSynapse = false
      Create.newSynapse.topic1id = JIT.tempNode.getData('topic').id
      Create.newSynapse.topic2id = JIT.tempNode2.getData('topic').id
      JIT.tempNode2.setData('dim', 25, 'current')
      Visualize.mGraph.plot()
      midpoint.x = JIT.tempNode.pos.getc().x + (JIT.tempNode2.pos.getc().x - JIT.tempNode.pos.getc().x) / 2
      midpoint.y = JIT.tempNode.pos.getc().y + (JIT.tempNode2.pos.getc().y - JIT.tempNode.pos.getc().y) / 2
      pixelPos = Util.coordsToPixels(Visualize.mGraph, midpoint)
      $('#new_synapse').css('left', pixelPos.x + 'px')
      $('#new_synapse').css('top', pixelPos.y + 'px')
      Create.newSynapse.open()
      JIT.tempNode = null
      JIT.tempNode2 = null
      JIT.tempInit = false
    } else if (!JIT.tempInit && node && !node.nodeFrom) {
      // this means you dragged an existing node, autosave that to the database

      // check whether to save mappings
      const checkWhetherToSave = function() {
        const map = Active.Map
        if (!map) return false
        return map.authorizeToEdit(Active.Mapper)
      }

      if (checkWhetherToSave()) {
        mapping = node.getData('mapping')
        mapping.save({
          xloc: node.getPos().x,
          yloc: node.getPos().y
        })
        // also save any other selected nodes that also got dragged along
        const l = Selected.Nodes.length
        for (var i = l - 1; i >= 0; i -= 1) {
          const n = Selected.Nodes[i]
          if (n !== node) {
            mapping = n.getData('mapping')
            mapping.save({
              xloc: n.getPos().x,
              yloc: n.getPos().y
            })
          }
        }
      }
    }
  }, // onDragEndTopicHandler
  canvasClickHandler: function(canvasLoc, e) {
    // grab the location and timestamp of the click
    const storedTime = Mouse.lastCanvasClick
    const now = Date.now() // not compatible with IE8 FYI
    Mouse.lastCanvasClick = now

    const authorized = Active.Map && Active.Map.authorizeToEdit(Active.Mapper)

    if (now - storedTime < Mouse.DOUBLE_CLICK_TOLERANCE && !Mouse.didPan) {
      if (Active.Map && !authorized) {
        GlobalUI.notifyUser('Cannot edit Public map.')
        return
      } else if (Active.Topic) {
        GlobalUI.notifyUser('Cannot create in Topic view.')
        return
      }
      // DOUBLE CLICK
      // pop up node creation :)
      Create.newTopic.addSynapse = false
      Create.newTopic.x = canvasLoc.x
      Create.newTopic.y = canvasLoc.y
      $('#new_topic').css('left', e.clientX + 'px')
      $('#new_topic').css('top', e.clientY + 'px')
      Create.newTopic.open()
    } else if (!Mouse.didPan) {
      // SINGLE CLICK, no pan
      Filter.close()
      TopicCard.hideCard()
      SynapseCard.hideCard()
      Create.newTopic.hide()
      $('.rightclickmenu').remove()
      // reset the draw synapse positions to false
      Mouse.synapseStartCoordinates = []
      Mouse.synapseEndCoordinates = null
      JIT.tempInit = false
      JIT.tempNode = null
      JIT.tempNode2 = null
      if (!e.ctrlKey && !e.shiftKey) {
        Control.deselectAllEdges()
        Control.deselectAllNodes()
      }
    } else {
      // SINGLE CLICK, resulting from pan
      Create.newTopic.hide()
    }
  }, // canvasClickHandler
  updateTopicPositions: function(node, pos) {
    const len = Selected.Nodes.length
    // this is used to send nodes that are moving to
    // other realtime collaborators on the same map
    const positionsToSend = {}

    // first define offset for each node
    var xOffset = []
    var yOffset = []
    for (let i = 0; i < len; i += 1) {
      const n = Selected.Nodes[i]
      xOffset[i] = n.pos.getc().x - node.pos.getc().x
      yOffset[i] = n.pos.getc().y - node.pos.getc().y
    } // for

    for (let i = 0; i < len; i += 1) {
      const n = Selected.Nodes[i]
      const x = pos.x + xOffset[i]
      const y = pos.y + yOffset[i]
      if (n.pos.rho || n.pos.rho === 0) {
        // this means we're in topic view
        const rho = Math.sqrt(x * x + y * y)
        const theta = Math.atan2(y, x)
        n.pos.setp(theta, rho)
      } else {
        n.pos.setc(x, y)
      }

      if (Active.Map) {
        const topic = n.getData('topic')
        // we use the topic ID not the node id
        // because we can't depend on the node id
        // to be the same as on other collaborators
        // maps
        positionsToSend[topic.id] = n.pos
      }
    } // for

    if (Active.Map) {
      $(document).trigger(JIT.events.topicDrag, [positionsToSend])
    }
  },

  nodeDoubleClickHandler: function(node, e) {
    TopicCard.showCard(node)
  }, // nodeDoubleClickHandler
  edgeDoubleClickHandler: function(adj, e) {
    SynapseCard.showCard(adj, e)
  }, // nodeDoubleClickHandler
  nodeWasDoubleClicked: function() {
    // grab the timestamp of the click
    const storedTime = Mouse.lastNodeClick
    const now = Date.now() // not compatible with IE8 FYI
    Mouse.lastNodeClick = now

    if (now - storedTime < Mouse.DOUBLE_CLICK_TOLERANCE) {
      return true
    } else {
      return false
    }
  }, // nodeWasDoubleClicked
  handleSelectionBeforeDragging: function(node, e) {
    if (Selected.Nodes.length === 0) {
      Control.selectNode(node, e)
    }
    if (Selected.Nodes.indexOf(node) === -1) {
      if (e.shiftKey) {
        Control.selectNode(node, e)
      } else {
        Control.deselectAllEdges()
        Control.deselectAllNodes()
        Control.selectNode(node, e)
      }
    }
  }, //  handleSelectionBeforeDragging
  getNodeXY: function(node) {
    if (typeof node.pos.x === 'number' && typeof node.pos.y === 'number') {
      return node.pos
    } else if (typeof node.pos.theta === 'number' && typeof node.pos.rho === 'number') {
      return new $jit.Polar(node.pos.theta, node.pos.rho).getc(true)
    } else {
      console.error('getNodeXY: unrecognized node pos format')
      return {}
    }
  },
  selectWithBox: function(e) {
    const self = this
    let sX = Mouse.boxStartCoordinates.x
    let sY = Mouse.boxStartCoordinates.y
    let eX = Mouse.boxEndCoordinates.x
    let eY = Mouse.boxEndCoordinates.y

    if (!e.shiftKey) {
      Control.deselectAllNodes()
      Control.deselectAllEdges()
    }

    // select all nodes that are within the box
    Visualize.mGraph.graph.eachNode(function(n) {
      const pos = self.getNodeXY(n)
      const x = pos.x
      const y = pos.y

      // depending on which way the person dragged the box, check that
      // x and y are between the start and end values of the box
      if ((sX < x && x < eX && sY < y && y < eY) ||
        (sX > x && x > eX && sY > y && y > eY) ||
        (sX > x && x > eX && sY < y && y < eY) ||
        (sX < x && x < eX && sY > y && y > eY)) {
        if (e.shiftKey) {
          if (n.selected) {
            Control.deselectNode(n)
          } else {
            Control.selectNode(n, e)
          }
        } else {
          Control.selectNode(n, e)
        }
      }
    })

    // Convert selection box coordinates to traditional coordinates (+,+) in upper right
    sY = -1 * sY
    eY = -1 * eY

    const edgesToToggle = []
    DataModel.Synapses.each(function(synapse) {
      const e = synapse.get('edge')
      if (edgesToToggle.indexOf(e) === -1) {
        edgesToToggle.push(e)
      }
    })
    edgesToToggle.forEach(function(edge) {
      const fromNodePos = self.getNodeXY(edge.nodeFrom)
      const fromNodeX = fromNodePos.x
      const fromNodeY = -1 * fromNodePos.y
      const toNodePos = self.getNodeXY(edge.nodeTo)
      const toNodeX = toNodePos.x
      const toNodeY = -1 * toNodePos.y

      let maxX = fromNodeX
      let maxY = fromNodeY
      let minX = fromNodeX
      let minY = fromNodeY

      // Correct maxX, MaxY values
      ;(toNodeX > maxX) ? (maxX = toNodeX) : (minX = toNodeX)
      ;(toNodeY > maxY) ? (maxY = toNodeY) : (minY = toNodeY)

      let maxBoxX = sX
      let maxBoxY = sY
      let minBoxX = sX
      let minBoxY = sY

      // Correct maxBoxX, maxBoxY values
      ;(eX > maxBoxX) ? (maxBoxX = eX) : (minBoxX = eX)
      ;(eY > maxBoxY) ? (maxBoxY = eY) : (minBoxY = eY)

      // Find the slopes from the synapse fromNode to the 4 corners of the selection box
      const slopes = []
      slopes.push((sY - fromNodeY) / (sX - fromNodeX))
      slopes.push((sY - fromNodeY) / (eX - fromNodeX))
      slopes.push((eY - fromNodeY) / (eX - fromNodeX))
      slopes.push((eY - fromNodeY) / (sX - fromNodeX))

      let minSlope = slopes[0]
      let maxSlope = slopes[0]
      slopes.forEach(function(entry) {
        if (entry > maxSlope) maxSlope = entry
        if (entry < minSlope) minSlope = entry
      })

      // Find synapse-in-question's slope
      const synSlope = (toNodeY - fromNodeY) / (toNodeX - fromNodeX)
      const b = fromNodeY - synSlope * fromNodeX

      // Use the selection box edges as test cases for synapse intersection
      let testX = sX
      let testY = synSlope * testX + b

      let selectTest

      if (testX >= minX && testX <= maxX && testY >= minY && testY <= maxY && testY >= minBoxY && testY <= maxBoxY) {
        selectTest = true
      }

      testX = eX
      testY = synSlope * testX + b

      if (testX >= minX && testX <= maxX && testY >= minY && testY <= maxY && testY >= minBoxY && testY <= maxBoxY) {
        selectTest = true
      }

      testY = sY
      testX = (testY - b) / synSlope

      if (testX >= minX && testX <= maxX && testY >= minY && testY <= maxY && testX >= minBoxX && testX <= maxBoxX) {
        selectTest = true
      }

      testY = eY
      testX = (testY - b) / synSlope

      if (testX >= minX && testX <= maxX && testY >= minY && testY <= maxY && testX >= minBoxX && testX <= maxBoxX) {
        selectTest = true
      }

      // Case where the synapse is wholly enclosed in the seldction box
      if (fromNodeX >= minBoxX && fromNodeX <= maxBoxX && fromNodeY >= minBoxY && fromNodeY <= maxBoxY && toNodeX >= minBoxX && toNodeX <= maxBoxX && toNodeY >= minBoxY && toNodeY <= maxBoxY) {
        selectTest = true
      }

      // The test synapse was selected!

      if (selectTest) {
        // shiftKey = toggleSelect, otherwise
        if (e.shiftKey) {
          if (Selected.Edges.indexOf(edge) !== -1) {
            Control.deselectEdge(edge)
          } else {
            Control.selectEdge(edge)
          }
        } else {
          Control.selectEdge(edge)
        }
      }
    })
    Mouse.boxStartCoordinates = false
    Mouse.boxEndCoordinates = false
    Visualize.mGraph.plot()
  }, // selectWithBox
  drawSelectBox: function(eventInfo, e) {
    const ctx = Visualize.mGraph.canvas.getCtx()

    const startX = Mouse.boxStartCoordinates.x
    const startY = Mouse.boxStartCoordinates.y
    const currX = eventInfo.getPos().x
    const currY = eventInfo.getPos().y

    Visualize.mGraph.canvas.clear()
    Visualize.mGraph.plot()

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(startX, currY)
    ctx.lineTo(currX, currY)
    ctx.lineTo(currX, startY)
    ctx.lineTo(startX, startY)
    ctx.strokeStyle = 'black'
    ctx.stroke()
  }, // drawSelectBox
  selectNodeOnClickHandler: function(node, e) {
    if (Visualize.mGraph.busy) return

    const self = JIT

    // Copy topic title to clipboard
    if (e.button === 1 && e.ctrlKey) clipboard.copy(node.name)

    // catch right click on mac, which is often like ctrl+click
    if (navigator.platform.indexOf('Mac') !== -1 && e.ctrlKey) {
      self.selectNodeOnRightClickHandler(node, e)
      return
    }

    // if on a topic page, let alt+click center you on a new topic
    if (Active.Topic && e.altKey) {
      JIT.RGraph.centerOn(node.id)
      return
    }

    const check = self.nodeWasDoubleClicked()
    if (check) {
      self.nodeDoubleClickHandler(node, e)
      return
    } else {
      // wait a certain length of time, then check again, then run this code
      setTimeout(function() {
        if (!JIT.nodeWasDoubleClicked()) {
          var nodeAlreadySelected = node.selected

          if (e.button !== 1) {
            if (!e.shiftKey) {
              Control.deselectAllNodes()
              Control.deselectAllEdges()
            }

            if (nodeAlreadySelected) {
              Control.deselectNode(node)
            } else {
              Control.selectNode(node, e)
            }

            // trigger animation to final styles
            Visualize.mGraph.fx.animate({
              modes: ['edge-property:lineWidth:color:alpha'],
              duration: 500
            })
            Visualize.mGraph.plot()
          } else {
            if (!e.ctrlKey) {
              var len = Selected.Nodes.length

              for (let i = 0; i < len; i += 1) {
                let n = Selected.Nodes[i]
                let result = Util.openLink(DataModel.Topics.get(n.id).attributes.link)

                if (!result) { // if link failed to open
                  break
                }
              }

              if (!node.selected) {
                Util.openLink(DataModel.Topics.get(node.id).attributes.link)
              }
            }
          }
        }
      }, Mouse.DOUBLE_CLICK_TOLERANCE)
    }
  }, // selectNodeOnClickHandler
  selectNodeOnRightClickHandler: function(node, e) {
    // the 'node' variable is a JIT node, the one that was clicked on
    // the 'e' variable is the click event

    e.preventDefault()
    e.stopPropagation()

    if (Visualize.mGraph.busy) return

    // select the node
    Control.selectNode(node, e)

    // delete old right click menu
    $('.rightclickmenu').remove()
    // create new menu for clicked on node
    const rightclickmenu = document.createElement('div')
    rightclickmenu.className = 'rightclickmenu'
    // prevent the custom context menu from immediately opening the default context menu as well
    rightclickmenu.setAttribute('oncontextmenu', 'return false')

    // add the proper options to the menu
    let menustring = '<ul>'

    const authorized = Active.Map && Active.Map.authorizeToEdit(Active.Mapper)

    const disabled = authorized ? '' : 'disabled'

    if (Active.Map) menustring += '<li class="rc-hide"><div class="rc-icon"></div>Hide until refresh<div class="rc-keyboard">Ctrl+H</div></li>'
    if (Active.Map && Active.Mapper) menustring += '<li class="rc-remove ' + disabled + '"><div class="rc-icon"></div>Remove from map<div class="rc-keyboard">Ctrl+M</div></li>'
    if (Active.Topic) menustring += '<li class="rc-remove"><div class="rc-icon"></div>Remove from view<div class="rc-keyboard">Ctrl+M</div></li>'
    if (Active.Map && Active.Mapper) menustring += '<li class="rc-delete ' + disabled + '"><div class="rc-icon"></div>Delete<div class="rc-keyboard">Ctrl+D</div></li>'

    if (Active.Topic) {
      menustring += '<li class="rc-center"><div class="rc-icon"></div>Center this topic<div class="rc-keyboard">Alt+E</div></li>'
    }

    menustring += '<li class="rc-popout"><div class="rc-icon"></div>Open in new tab</li>'

    if (Active.Mapper) {
      const options = outdent`
        <ul>
          <li class="changeP toCommons"><div class="rc-perm-icon"></div>commons</li>
          <li class="changeP toPublic"><div class="rc-perm-icon"></div>public</li>
          <li class="changeP toPrivate"><div class="rc-perm-icon"></div>private</li>
        </ul>`

      menustring += '<li class="rc-spacer"></li>'

      menustring += outdent`
        <li class="rc-permission">
          <div class="rc-icon"></div>
          Change permissions
          ${options}
          <div class="expandLi"></div>
        </li>`

      const metacodeOptions = $('#metacodeOptions').html()

      menustring += '<li class="rc-metacode"><div class="rc-icon"></div>Change metacode' + metacodeOptions + '<div class="expandLi"></div></li>'
    }
    if (Active.Topic) {
      if (!Active.Mapper) {
        menustring += '<li class="rc-spacer"></li>'
      }

      // set up the get sibling menu as a "lazy load"
      // only fill in the submenu when they hover over the get siblings list item
      const siblingMenu = outdent`
        <ul id="fetchSiblingList">
          <li class="fetchAll">All<div class="rc-keyboard">Alt+R</div></li>
          <li id="loadingSiblings"></li>
        </ul>`
      menustring += '<li class="rc-siblings"><div class="rc-icon"></div>Reveal siblings' + siblingMenu + '<div class="expandLi"></div></li>'
    }

    menustring += '</ul>'
    rightclickmenu.innerHTML = menustring

    // position the menu where the click happened
    const position = {}
    const RIGHTCLICK_WIDTH = 300
    const RIGHTCLICK_HEIGHT = 144 // this does vary somewhat, but we can use static
    const SUBMENUS_WIDTH = 256
    const MAX_SUBMENU_HEIGHT = 270
    const windowWidth = $(window).width()
    const windowHeight = $(window).height()

    if (windowWidth - e.clientX < SUBMENUS_WIDTH) {
      position.right = windowWidth - e.clientX
      $(rightclickmenu).addClass('moveMenusToLeft')
    } else if (windowWidth - e.clientX < RIGHTCLICK_WIDTH) {
      position.right = windowWidth - e.clientX
    } else if (windowWidth - e.clientX < RIGHTCLICK_WIDTH + SUBMENUS_WIDTH) {
      position.left = e.clientX
      $(rightclickmenu).addClass('moveMenusToLeft')
    } else {
      position.left = e.clientX
    }

    if (windowHeight - e.clientY < MAX_SUBMENU_HEIGHT) {
      position.bottom = windowHeight - e.clientY
      $(rightclickmenu).addClass('moveMenusUp')
    } else if (windowHeight - e.clientY < RIGHTCLICK_HEIGHT + MAX_SUBMENU_HEIGHT) {
      position.top = e.clientY
      $(rightclickmenu).addClass('moveMenusUp')
    } else {
      position.top = e.clientY
    }

    $(rightclickmenu).css(position)
    // add the menu to the page
    $('#wrapper').append(rightclickmenu)

    // attach events to clicks on the list items

    // delete the selected things from the database
    if (authorized) {
      $('.rc-delete').click(function() {
        $('.rightclickmenu').remove()
        Control.deleteSelected()
      })
    }

    // remove the selected things from the map
    if (Active.Topic || authorized) {
      $('.rc-remove').click(function() {
        $('.rightclickmenu').remove()
        Control.removeSelectedEdges()
        Control.removeSelectedNodes()
      })
    }

    // hide selected nodes and synapses until refresh
    $('.rc-hide').click(function() {
      $('.rightclickmenu').remove()
      Control.hideSelectedEdges()
      Control.hideSelectedNodes()
    })

    // when in radial, center on the topic you picked
    $('.rc-center').click(function() {
      $('.rightclickmenu').remove()
      Topic.centerOn(node.id)
    })

    // open the entity in a new tab
    $('.rc-popout').click(function() {
      $('.rightclickmenu').remove()
      const win = window.open('/topics/' + node.id, '_blank')
      win.focus()
    })

    // change the permission of all the selected nodes and synapses that you were the originator of
    $('.rc-permission li').click(function() {
      $('.rightclickmenu').remove()
      // $(this).text() will be 'commons' 'public' or 'private'
      Control.updateSelectedPermissions($(this).text())
    })

    // change the metacode of all the selected nodes that you have edit permission for
    $('.rc-metacode li li').click(function() {
      $('.rightclickmenu').remove()
      //
      Control.updateSelectedMetacodes($(this).attr('data-id'))
    })

    // fetch relatives
    let fetchSent = false
    $('.rc-siblings').hover(function() {
      if (!fetchSent) {
        JIT.populateRightClickSiblings(node)
        fetchSent = true
      }
    })
    $('.rc-siblings .fetchAll').click(function() {
      $('.rightclickmenu').remove()
      // data-id is a metacode id
      Topic.fetchRelatives(node)
    })
  }, // selectNodeOnRightClickHandler,
  populateRightClickSiblings: function(node) {
    // depending on how many topics are selected, do different things
    const topic = node.getData('topic')

    // add a loading icon for now
    const loader = new CanvasLoader('loadingSiblings')
    loader.setColor('#4FC059') // default is '#000000'
    loader.setDiameter(15) // default is 40
    loader.setDensity(41) // default is 40
    loader.setRange(0.9) // default is 1.3
    loader.show() // Hidden by default

    const topics = DataModel.Topics.map(function(t) { return t.id })
    const topicsString = topics.join()

    const successCallback = function(data) {
      $('#loadingSiblings').remove()

      for (var key in data) {
        const string = `${DataModel.Metacodes.get(key).get('name')} (${data[key]})`
        $('#fetchSiblingList').append(`<li class="getSiblings" data-id="${key}">${string}</li>`)
      }

      $('.rc-siblings .getSiblings').click(function() {
        $('.rightclickmenu').remove()
        // data-id is a metacode id
        Topic.fetchRelatives(node, $(this).attr('data-id'))
      })
    }

    $.ajax({
      type: 'GET',
      url: '/topics/' + topic.id + '/relative_numbers.json?network=' + topicsString,
      success: successCallback,
      error: function() {}
    })
  },
  selectEdgeOnClickHandler: function(adj, e) {
    if (Visualize.mGraph.busy) return

    const self = JIT
    var synapseText = adj.data.$synapses[0].attributes.desc
    // Copy synapse label to clipboard
    if (e.button === 1 && e.ctrlKey && synapseText !== '') clipboard.copy(synapseText)

    // catch right click on mac, which is often like ctrl+click
    if (navigator.platform.indexOf('Mac') !== -1 && e.ctrlKey) {
      self.selectEdgeOnRightClickHandler(adj, e)
      return
    }

    const check = self.nodeWasDoubleClicked()
    if (check) {
      self.edgeDoubleClickHandler(adj, e)
      return
    } else {
      // wait a certain length of time, then check again, then run this code
      setTimeout(function() {
        if (!JIT.nodeWasDoubleClicked()) {
          const edgeAlreadySelected = Selected.Edges.indexOf(adj) !== -1

          if (!e.shiftKey) {
            Control.deselectAllNodes()
            Control.deselectAllEdges()
          }

          if (edgeAlreadySelected) {
            Control.deselectEdge(adj)
          } else {
            Control.selectEdge(adj)
          }

          Visualize.mGraph.plot()
        }
      }, Mouse.DOUBLE_CLICK_TOLERANCE)
    }
  }, // selectEdgeOnClickHandler
  selectEdgeOnRightClickHandler: function(adj, e) {
    // the 'node' variable is a JIT node, the one that was clicked on
    // the 'e' variable is the click event

    if (adj.getData('alpha') === 0) return // don't do anything if the edge is filtered

    e.preventDefault()
    e.stopPropagation()

    if (Visualize.mGraph.busy) return

    Control.selectEdge(adj)

    // delete old right click menu
    $('.rightclickmenu').remove()
    // create new menu for clicked on node
    const rightclickmenu = document.createElement('div')
    rightclickmenu.className = 'rightclickmenu'
    // prevent the custom context menu from immediately opening the default context menu as well
    rightclickmenu.setAttribute('oncontextmenu', 'return false')

    // add the proper options to the menu
    let menustring = '<ul>'

    const authorized = Active.Map && Active.Map.authorizeToEdit(Active.Mapper)

    const disabled = authorized ? '' : 'disabled'

    if (Active.Map) menustring += '<li class="rc-hide"><div class="rc-icon"></div>Hide until refresh<div class="rc-keyboard">Ctrl+H</div></li>'
    if (Active.Map && Active.Mapper) menustring += '<li class="rc-remove ' + disabled + '"><div class="rc-icon"></div>Remove from map<div class="rc-keyboard">Ctrl+M</div></li>'
    if (Active.Topic) menustring += '<li class="rc-remove"><div class="rc-icon"></div>Remove from view<div class="rc-keyboard">Ctrl+M</div></li>'
    if (Active.Map && Active.Mapper) menustring += '<li class="rc-delete ' + disabled + '"><div class="rc-icon"></div>Delete<div class="rc-keyboard">Ctrl+D</div></li>'

    if (Active.Map && Active.Mapper) menustring += '<li class="rc-spacer"></li>'

    if (Active.Mapper) {
      const permOptions = outdent`
        <ul>
          <li class="changeP toCommons"><div class="rc-perm-icon"></div>commons</li>
          <li class="changeP toPublic"><div class="rc-perm-icon"></div>public</li>           <li class="changeP toPrivate"><div class="rc-perm-icon"></div>private</li>         </ul>`

      menustring += '<li class="rc-permission"><div class="rc-icon"></div>Change permissions' + permOptions + '<div class="expandLi"></div></li>'
    }

    menustring += '</ul>'
    rightclickmenu.innerHTML = menustring

    // position the menu where the click happened
    const position = {}
    const RIGHTCLICK_WIDTH = 300
    const RIGHTCLICK_HEIGHT = 144 // this does vary somewhat, but we can use static
    const SUBMENUS_WIDTH = 256
    const MAX_SUBMENU_HEIGHT = 270
    const windowWidth = $(window).width()
    const windowHeight = $(window).height()

    if (windowWidth - e.clientX < SUBMENUS_WIDTH) {
      position.right = windowWidth - e.clientX
      $(rightclickmenu).addClass('moveMenusToLeft')
    } else if (windowWidth - e.clientX < RIGHTCLICK_WIDTH) {
      position.right = windowWidth - e.clientX
    } else position.left = e.clientX

    if (windowHeight - e.clientY < MAX_SUBMENU_HEIGHT) {
      position.bottom = windowHeight - e.clientY
      $(rightclickmenu).addClass('moveMenusUp')
    } else if (windowHeight - e.clientY < RIGHTCLICK_HEIGHT + MAX_SUBMENU_HEIGHT) {
      position.top = e.clientY
      $(rightclickmenu).addClass('moveMenusUp')
    } else position.top = e.clientY

    $(rightclickmenu).css(position)

    // add the menu to the page
    $('#wrapper').append(rightclickmenu)

    // attach events to clicks on the list items

    // delete the selected things from the database
    if (authorized) {
      $('.rc-delete').click(function() {
        $('.rightclickmenu').remove()
        Control.deleteSelected()
      })
    }

    // remove the selected things from the map
    if (authorized) {
      $('.rc-remove').click(function() {
        $('.rightclickmenu').remove()
        Control.removeSelectedEdges()
        Control.removeSelectedNodes()
      })
    }

    // hide selected nodes and synapses until refresh
    $('.rc-hide').click(function() {
      $('.rightclickmenu').remove()
      Control.hideSelectedEdges()
      Control.hideSelectedNodes()
    })

    // change the permission of all the selected nodes and synapses that you were the originator of
    $('.rc-permission li').click(function() {
      $('.rightclickmenu').remove()
      // $(this).text() will be 'commons' 'public' or 'private'
      Control.updateSelectedPermissions($(this).text())
    })
  }, // selectEdgeOnRightClickHandler
  SmoothPanning: function() {
    const sx = Visualize.mGraph.canvas.scaleOffsetX
    const sy = Visualize.mGraph.canvas.scaleOffsetY
    const yVelocity = Mouse.changeInY // initial y velocity
    const xVelocity = Mouse.changeInX // initial x velocity
    let easing = 1 // frictional value

    window.clearInterval(panningInt)
    panningInt = setInterval(function() {
      myTimer()
    }, 1)

    function myTimer() {
      Visualize.mGraph.canvas.translate(xVelocity * easing * 1 / sx, yVelocity * easing * 1 / sy)
      $(document).trigger(JIT.events.pan)
      easing = easing * 0.75

      if (easing < 0.1) window.clearInterval(panningInt)
    }
  }, // SmoothPanning
  renderMidArrow: function(from, to, dim, swap, canvas, placement, newSynapse) {
    const ctx = canvas.getCtx()
    // invert edge direction
    if (swap) {
      const tmp = from
      from = to
      to = tmp
    }
    // vect represents a line from tip to tail of the arrow
    const vect = new $jit.Complex(to.x - from.x, to.y - from.y)
    // scale it
    vect.$scale(dim / vect.norm())
    // compute the midpoint of the edge line
    const newX = (to.x - from.x) * placement + from.x
    const newY = (to.y - from.y) * placement + from.y
    const midPoint = new $jit.Complex(newX, newY)

    // move midpoint by half the "length" of the arrow so the arrow is centered on the midpoint
    const arrowPoint = new $jit.Complex((vect.x / 0.7) + midPoint.x, (vect.y / 0.7) + midPoint.y)
    // compute the tail intersection point with the edge line
    const intermediatePoint = new $jit.Complex(arrowPoint.x - vect.x, arrowPoint.y - vect.y)
    // vector perpendicular to vect
    const normal = new $jit.Complex(-vect.y / 2, vect.x / 2)
    const v1 = intermediatePoint.add(normal)
    const v2 = intermediatePoint.$add(normal.$scale(-1))

    if (newSynapse) {
      ctx.strokeStyle = '#4fc059'
      ctx.lineWidth = 2
      ctx.globalAlpha = 1
    }
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(v1.x, v1.y)
    ctx.lineTo(arrowPoint.x, arrowPoint.y)
    ctx.lineTo(v2.x, v2.y)
    ctx.stroke()
  }, // renderMidArrow
  renderEdgeArrows: function(edgeHelper, adj, synapse, canvas) {
    const self = JIT

    const directionCat = synapse.get('category')
    const direction = synapse.getDirection()

    const pos = adj.nodeFrom.pos.getc(true)
    const posChild = adj.nodeTo.pos.getc(true)

    // plot arrow edge
    if (!direction) {
      // render nothing for this arrow if the direction couldn't be retrieved
    } else if (directionCat === 'none') {
      edgeHelper.line.render({
        x: pos.x,
        y: pos.y
      }, {
        x: posChild.x,
        y: posChild.y
      }, canvas)
    } else if (directionCat === 'both') {
      self.renderMidArrow({
        x: pos.x,
        y: pos.y
      }, {
        x: posChild.x,
        y: posChild.y
      }, 13, true, canvas, 0.7)
      self.renderMidArrow({
        x: pos.x,
        y: pos.y
      }, {
        x: posChild.x,
        y: posChild.y
      }, 13, false, canvas, 0.7)
    } else if (directionCat === 'from-to') {
      const inv = (direction[0] !== adj.nodeFrom.id)
      self.renderMidArrow({
        x: pos.x,
        y: pos.y
      }, {
        x: posChild.x,
        y: posChild.y
      }, 13, inv, canvas, 0.7)
      self.renderMidArrow({
        x: pos.x,
        y: pos.y
      }, {
        x: posChild.x,
        y: posChild.y
      }, 13, inv, canvas, 0.3)
    }
  }, // renderEdgeArrows
  zoomIn: function(event) {
    Visualize.mGraph.canvas.scale(1.25, 1.25)
    $(document).trigger(JIT.events.zoom, [event])
  },
  zoomOut: function(event) {
    Visualize.mGraph.canvas.scale(0.8, 0.8)
    $(document).trigger(JIT.events.zoom, [event])
  },
  centerMap: function(canvas) {
    const offsetScale = canvas.scaleOffsetX

    canvas.scale(1 / offsetScale, 1 / offsetScale)

    const offsetX = canvas.translateOffsetX
    const offsetY = canvas.translateOffsetY

    canvas.translate(-1 * offsetX, -1 * offsetY)
  },
  zoomToBox: function(event) {
    const sX = Mouse.boxStartCoordinates.x
    const sY = Mouse.boxStartCoordinates.y
    const eX = Mouse.boxEndCoordinates.x
    const eY = Mouse.boxEndCoordinates.y

    let canvas = Visualize.mGraph.canvas
    JIT.centerMap(canvas)

    let height = $(document).height()
    let width = $(document).width()

    let spanX = Math.abs(sX - eX)
    let spanY = Math.abs(sY - eY)
    let ratioX = width / spanX
    let ratioY = height / spanY

    let newRatio = Math.min(ratioX, ratioY)

    if (canvas.scaleOffsetX * newRatio <= 5 && canvas.scaleOffsetX * newRatio >= 0.2) {
      canvas.scale(newRatio, newRatio)
    } else if (canvas.scaleOffsetX * newRatio > 5) {
      newRatio = 5 / canvas.scaleOffsetX
      canvas.scale(newRatio, newRatio)
    } else {
      newRatio = 0.2 / canvas.scaleOffsetX
      canvas.scale(newRatio, newRatio)
    }

    const cogX = (sX + eX) / 2
    const cogY = (sY + eY) / 2

    canvas.translate(-1 * cogX, -1 * cogY)
    $(document).trigger(JIT.events.zoom, [event])

    Mouse.boxStartCoordinates = false
    Mouse.boxEndCoordinates = false
    Visualize.mGraph.plot()
  },
  zoomExtents: function(event, canvas, denySelected) {
    JIT.centerMap(canvas)
    let height = canvas.getSize().height
    let width = canvas.getSize().width
    let maxX
    let maxY
    let minX
    let minY
    let counter = 0

    let nodes
    if (!denySelected && Selected.Nodes.length > 0) {
      nodes = Selected.Nodes
    } else {
      nodes = _.values(Visualize.mGraph.graph.nodes)
    }

    if (nodes.length > 1) {
      nodes.forEach(function(n) {
        let x = n.pos.x
        let y = n.pos.y

        if (counter === 0 && n.getData('alpha') === 1) {
          maxX = x
          minX = x
          maxY = y
          minY = y
        }

        let arrayOfLabelLines = Util.splitLine(n.name, 25).split('\n')
        let dim = n.getData('dim')
        let ctx = canvas.getCtx()

        let height = 25 * arrayOfLabelLines.length

        let lineWidths = []
        for (let index = 0; index < arrayOfLabelLines.length; ++index) {
          lineWidths.push(ctx.measureText(arrayOfLabelLines[index]).width)
        }
        let width = Math.max.apply(null, lineWidths) + 8

        // only adjust these values if the node is not filtered
        if (n.getData('alpha') === 1) {
          maxX = Math.max(x + width / 2, maxX)
          maxY = Math.max(y + n.getData('height') + 5 + height, maxY)
          minX = Math.min(x - width / 2, minX)
          minY = Math.min(y - dim, minY)

          counter++
        }
      })

      let spanX = maxX - minX
      let spanY = maxY - minY
      let ratioX = spanX / width
      let ratioY = spanY / height

      let cogX = (maxX + minX) / 2
      let cogY = (maxY + minY) / 2

      canvas.translate(-1 * cogX, -1 * cogY)

      let newRatio = Math.max(ratioX, ratioY)
      let scaleMultiplier = 1 / newRatio * 0.9

      if (canvas.scaleOffsetX * scaleMultiplier <= 3 && canvas.scaleOffsetX * scaleMultiplier >= 0.2) {
        canvas.scale(scaleMultiplier, scaleMultiplier)
      } else if (canvas.scaleOffsetX * scaleMultiplier > 3) {
        scaleMultiplier = 3 / canvas.scaleOffsetX
        canvas.scale(scaleMultiplier, scaleMultiplier)
      } else {
        scaleMultiplier = 0.2 / canvas.scaleOffsetX
        canvas.scale(scaleMultiplier, scaleMultiplier)
      }

      $(document).trigger(JIT.events.zoom, [event])
    } else if (nodes.length === 1) {
      nodes.forEach(function(n) {
        const x = n.pos.x
        const y = n.pos.y

        canvas.translate(-1 * x, -1 * y)
        $(document).trigger(JIT.events.zoom, [event])
      })
    }
  }
}

export default JIT

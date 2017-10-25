/* global $, Image */

import _ from 'lodash'
import clipboard from 'clipboard-js'

import $jit from '../patched/JIT'

import Active from './Active'
import ContextMenu from './Views/ContextMenu'
import Control from './Control'
import Create from './Create'
import DataModel from './DataModel'
import Filter from './Filter'
import GlobalUI, { ReactApp } from './GlobalUI'
import Map from './Map'
import Mouse from './Mouse'
import Selected from './Selected'
import Settings from './Settings'
import Synapse from './Synapse'
import SynapseCard from './SynapseCard'
import Topic from './Topic'
import TopicCard from './Views/TopicCard'
import Util from './Util'
import Visualize from './Visualize'

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
    pan: 'Metamaps:JIT:events:pan',
    zoom: 'Metamaps:JIT:events:zoom',
    animationDone: 'Metamaps:JIT:events:animationDone'
  },
  /**
   * This method will bind the event handlers it is interested and initialize the class.
   */
  init: function(serverData) {
    const self = JIT
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
      if (nodes[edge.nodeFrom] && nodes[edge.nodeTo]) {
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

    return jitReady
  },
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
      // Number of iterations for the FD algorithm
      iterations: 200,
      // Edge length
      levelDistance: 200,
      Navigation: {
        enable: true,
        panning: 'avoid nodes',
        zooming: 28, // zoom speed. higher is more sensible
        onZoom: function (event) {
          $(document).trigger(Metamaps.JIT.events.zoom, [event]);
        },
        onPan: function () {
          $(document).trigger(Metamaps.JIT.events.pan);
        }
      },
      Selection: {
        enable: true,
        type: 'Native',
        onDrawSelectBox: function (e, corner, oppositeCorner) {
          JIT.selectWithBox(e, corner, oppositeCorner);
        }
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
      Label: {
        type: 'Native',
        size: 20,
        family: 'arial',
        textBaseline: 'alphabetic',
        color: Settings.colors.labels.text
      },
      // this is events for clicking on edges and nodes in particular
      Events: {
        enable: true,
        enableForEdges: true,
        onMouseMove: function(node, eventInfo, e) {
          JIT.onMouseMoveHandler(node, eventInfo, e)
        },
        onDragMove: function(node, eventInfo, e) {
          JIT.onDragMoveTopicHandler(node, eventInfo, e)
        },
        onDragEnd: function(node, eventInfo, e) {
          JIT.onDragEndTopicHandler(node, eventInfo, e, false)
        },
        onDragCancel: function(node, eventInfo, e) {
          JIT.onDragCancelHandler(node, eventInfo, e, false)
        },
        onTouchMove: function(node, eventInfo, e) {
          JIT.onDragMoveTopicHandler(node, eventInfo, e)
        },
        onClick: function(node, eventInfo, e) {
          // remove the rightclickmenu
          ContextMenu.reset(ReactApp.render)
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
          ContextMenu.reset(ReactApp.render)
          if (e.target.id !== 'infovis-canvas') return false
          // clicking on a edge, node, or clicking on blank part of canvas?
          if (node.nodeFrom) {
            JIT.selectEdgeOnRightClickHandler(node, e)
          } else if (node && !node.nodeFrom) {
            JIT.selectNodeOnRightClickHandler(node, e)
          }
        }
      }
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
  },
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
        if (Active.Mapper.get('follow_map_on_contributed')) {
          Active.Mapper.followMap(Active.Map.id)
        }
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
      TopicCard.hideCard()
      SynapseCard.hideCard()
      Create.newTopic.hide()
      ContextMenu.reset(ReactApp.render)
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
  selectWithBox: function(e, corner, oppositeCorner) {
    const self = this
    let sX = corner.x
    let sY = corner.y
    let eX = oppositeCorner.x
    let eY = oppositeCorner.y

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
  }, // selectWithBox
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
    Control.selectNode(node, e)
    ContextMenu.selectNode(ReactApp.render, node, {x: e.clientX, y: e.clientY})
  }, // selectNodeOnRightClickHandler,
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
    // the 'adj' variable is a JIT adjacency, the one that was clicked on
    // the 'e' variable is the click event
    if (adj.getData('alpha') === 0) return // don't do anything if the edge is filtered
    e.preventDefault()
    e.stopPropagation()
    if (Visualize.mGraph.busy) return
    Control.selectEdge(adj)
    ContextMenu.selectEdge(ReactApp.render, adj, {x: e.clientX, y: e.clientY})
  }, // selectEdgeOnRightClickHandler
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
    const offsetX = canvas.translateOffsetX
    const offsetY = canvas.translateOffsetY
    canvas.scale(1 / offsetScale, 1 / offsetScale)
    canvas.translate(-1 * offsetX, -1 * offsetY)
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

/* global $, window, document, history */

import { Parser, HtmlRenderer, Node } from 'commonmark'
import { emojiIndex } from 'emoji-mart'
import { escapeRegExp } from 'lodash'

const emojiToShortcodes = {}
Object.keys(emojiIndex.emojis).forEach(key => {
  const emoji = emojiIndex.emojis[key]
  emojiToShortcodes[emoji.native] = emoji.colons
})

const Util = {
  // helper function to determine how many lines are needed
  // Line Splitter Function
  // copyright Stephen Chapman, 19th April 2006
  // you may copy this code but please keep the copyright notice as well
  splitLine: function(st, n) {
    var b = ''
    var s = st || ''
    while (s.length > n) {
      var c = s.substring(0, n)
      var d = c.lastIndexOf(' ')
      var e = c.lastIndexOf('\n')
      if (e !== -1) d = e
      if (d === -1) d = n
      b += c.substring(0, d) + '\n'
      s = s.substring(d + 1)
    }
    return b + s
  },

  nowDateFormatted: function(date = new Date(Date.now())) {
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    const year = date.getFullYear()

    return month + '/' + day + '/' + year
  },

  decodeEntities: function(desc) {
    let temp = document.createElement('p')
    temp.innerHTML = desc // browser handles the topics
    let str = temp.textContent || temp.innerText
    temp = null // delete the element
    return str
  }, // decodeEntities

  getDistance: function(p1, p2) {
    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
  },

  // Try using Visualize.mGraph
  coordsToPixels: function(mGraph, coords) {
    if (mGraph) {
      const canvas = mGraph.canvas
      const s = canvas.getSize()
      const p = canvas.getPos()
      const ox = canvas.translateOffsetX
      const oy = canvas.translateOffsetY
      const sx = canvas.scaleOffsetX
      const sy = canvas.scaleOffsetY
      return {
        x: (coords.x / (1 / sx)) + p.x + s.width / 2 + ox,
        y: (coords.y / (1 / sy)) + p.y + s.height / 2 + oy
      }
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  },

  // Try using Visualize.mGraph
  pixelsToCoords: function(mGraph, pixels) {
    if (mGraph) {
      const canvas = mGraph.canvas
      const s = canvas.getSize()
      const p = canvas.getPos()
      const ox = canvas.translateOffsetX
      const oy = canvas.translateOffsetY
      const sx = canvas.scaleOffsetX
      const sy = canvas.scaleOffsetY
      return {
        x: (pixels.x - p.x - s.width / 2 - ox) * (1 / sx),
        y: (pixels.y - p.y - s.height / 2 - oy) * (1 / sy)
      }
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  },
  getPastelColor: function(opts = {}) {
    const rseed = opts.rseed === undefined ? Math.random() : opts.rseed
    const gseed = opts.gseed === undefined ? Math.random() : opts.gseed
    const bseed = opts.bseed === undefined ? Math.random() : opts.bseed
    var r = (Math.round(rseed * 127) + 127).toString(16)
    var g = (Math.round(gseed * 127) + 127).toString(16)
    var b = (Math.round(bseed * 127) + 127).toString(16)
    return Util.colorLuminance('#' + r + g + b, -0.4)
  },
  // darkens a hex value by 'lum' percentage
  colorLuminance: function(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '')
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    lum = lum || 0

    // convert to decimal and change luminosity
    var rgb = '#'
    for (let i = 0; i < 3; i++) {
      let c = parseInt(hex.substr(i * 2, 2), 16)
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
      rgb += ('00' + c).substr(c.length)
    }

    return rgb
  },
  openLink: function(url) {
    var win = (url !== '') ? window.open(url, '_blank') : 'empty'

    if (win) {
      // Browser has allowed it to be opened
      return true
    } else {
      // Browser has blocked it
      window.alert('Please allow popups in order to open the link')
      return false
    }
  },
  mdToHTML: text => {
    const safeText = text || ''
    const parsed = new Parser().parse(safeText)

    // remove images to avoid http content in https context
    const walker = parsed.walker()
    for (let event = walker.next(); event = walker.next(); event) {
      const node = event.node
      if (node.type === 'image') {
        const imageAlt = node.firstChild.literal
        const imageSrc = node.destination
        const textNode = new Node('text', node.sourcepos)
        textNode.literal = `![${imageAlt}](${imageSrc})`

        node.insertBefore(textNode)
        node.unlink() // remove the image, replacing it with markdown
        walker.resumeAt(textNode, false)
      }
    }

    // use safe: true to filter xss
    return new HtmlRenderer({ safe: true }).render(parsed)
  },
  logCanvasAttributes: function(canvas) {
    const fakeMgraph = { canvas }
    return {
      scaleX: canvas.scaleOffsetX,
      scaleY: canvas.scaleOffsetY,
      centreCoords: Util.pixelsToCoords(fakeMgraph, { x: canvas.canvases[0].size.width / 2, y: canvas.canvases[0].size.height / 2 })
    }
  },
  resizeCanvas: function(canvas) {
    // Store the current canvas attributes, i.e. scale and map-coordinate at the centre of the user's screen
    const oldAttr = Util.logCanvasAttributes(canvas)

    // Resize the canvas to fill the new window size. Based on how JIT works, this also resets the map back to scale 1 and tranlations = 0
    canvas.resize($(window).width(), $(window).height())

    // Return the map to the original scale, and then put the previous central map-coordinate back to the centre of user's newly resized screen
    canvas.scale(oldAttr.scaleX, oldAttr.scaleY) // should be equal
    const newAttr = Util.logCanvasAttributes(canvas)
    canvas.translate(newAttr.centreCoords.x - oldAttr.centreCoords.x, newAttr.centreCoords.y - oldAttr.centreCoords.y)
  },
  removeEmoji: function(withEmoji) {
    let text = withEmoji
    Object.keys(emojiIndex.emojis).forEach(key => {
      const emoji = emojiIndex.emojis[key]
      text = text.replace(new RegExp(escapeRegExp(emoji.native), 'g'), emoji.colons)
    })
    return text
  },
  addEmoji: function(withoutEmoji, opts = { emoticons: true }) {
    let text = withoutEmoji
    Object.keys(emojiIndex.emojis).forEach(key => {
      const emoji = emojiIndex.emojis[key]
      text = text.replace(new RegExp(escapeRegExp(emoji.colons), 'g'), emoji.native)
    })
    if (opts.emoticons) {
      Object.keys(emojiIndex.emoticons).forEach(emoticon => {
        const key = emojiIndex.emoticons[emoticon]
        const emoji = emojiIndex.emojis[key]
        text = text.replace(new RegExp(escapeRegExp(emoticon), 'g'), emoji.native)
      })
    }
    return text
  },
  isTester: function(currentUser) {
    return ['connorturland@gmail.com', 'devin@callysto.com', 'chessscholar@gmail.com', 'solaureum@gmail.com', 'ishanshapiro@gmail.com'].indexOf(currentUser.get('email')) > -1
  },
  zoomOnPoint: function(graph, ans, zoomPoint) {
    var s = graph.canvas.getSize(),
      p = graph.canvas.getPos(),
      ox = graph.canvas.translateOffsetX,
      oy = graph.canvas.translateOffsetY,
      sx = graph.canvas.scaleOffsetX,
      sy = graph.canvas.scaleOffsetY

    var pointerCoordX = (zoomPoint.x - p.x - s.width / 2 - ox) * (1 / sx),
      pointerCoordY = (zoomPoint.y - p.y - s.height / 2 - oy) * (1 / sy)

      // This translates the canvas to be centred over the zoomPoint, then the canvas is zoomed as intended.
    graph.canvas.translate(-pointerCoordX, -pointerCoordY)
    graph.canvas.scale(ans, ans)

      // Get the canvas attributes again now that is has changed
    s = graph.canvas.getSize(),
      p = graph.canvas.getPos(),
      ox = graph.canvas.translateOffsetX,
      oy = graph.canvas.translateOffsetY,
      sx = graph.canvas.scaleOffsetX,
      sy = graph.canvas.scaleOffsetY
    var newX = (zoomPoint.x - p.x - s.width / 2 - ox) * (1 / sx),
      newY = (zoomPoint.y - p.y - s.height / 2 - oy) * (1 / sy)

      // Translate the canvas to put the pointer back over top the same coordinate it was over before
    graph.canvas.translate(newX - pointerCoordX, newY - pointerCoordY)
  },
  queryParams: function() {
    return window.location.search.replace(/(^\?)/, '').split('&').reduce((obj, item) => {
      item = item.split('=')
      obj[item[0]] = item[1]
      return obj
    }, {})
  },
  updateQueryParams: function(newValues, pathname = window.location.pathname) {
    const qp = Object.assign({}, Util.queryParams(), newValues)
    const newString = Object.keys(qp).filter(key => !!key).map(key => `${key}=${qp[key]}`).join('&')
    history.replaceState({}, document.title, `${pathname}?${newString}`)
  }
}

export default Util

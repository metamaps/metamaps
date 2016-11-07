/* global $ */

import { Parser, HtmlRenderer } from 'commonmark'

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
    // use safe: true to filter xss
    return new HtmlRenderer({ safe: true })
      .render(new Parser().parse(safeText))
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
    canvas.scale(oldAttr.scaleX, oldAttr.scaleY)
    const newAttr = Util.logCanvasAttributes(canvas)
    canvas.translate(newAttr.centreCoords.x - oldAttr.centreCoords.x, newAttr.centreCoords.y - oldAttr.centreCoords.y)
  }
}

export default Util

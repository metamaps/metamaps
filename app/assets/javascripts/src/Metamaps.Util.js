/* global Metamaps */

/*
 * Metamaps.Util.js
 *
 * Dependencies:
 *  - Metamaps.Visualize
 */

Metamaps.Util = {
  // helper function to determine how many lines are needed
  // Line Splitter Function
  // copyright Stephen Chapman, 19th April 2006
  // you may copy this code but please keep the copyright notice as well
  splitLine: function (st, n) {
    var b = ''
    var s = st ? st : ''
    while (s.length > n) {
      var c = s.substring(0, n)
      var d = c.lastIndexOf(' ')
      var e = c.lastIndexOf('\n')
      if (e != -1) d = e
      if (d == -1) d = n
      b += c.substring(0, d) + '\n'
      s = s.substring(d + 1)
    }
    return b + s
  },
  nowDateFormatted: function () {
    var date = new Date(Date.now())
    var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    var year = date.getFullYear()

    return month + '/' + day + '/' + year
  },
  decodeEntities: function (desc) {
    var str, temp = document.createElement('p')
    temp.innerHTML = desc // browser handles the topics
    str = temp.textContent || temp.innerText
    temp = null // delete the element
    return str
  }, // decodeEntities
  getDistance: function (p1, p2) {
    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
  },
  coordsToPixels: function (coords) {
    if (Metamaps.Visualize.mGraph) {
      var canvas = Metamaps.Visualize.mGraph.canvas,
        s = canvas.getSize(),
        p = canvas.getPos(),
        ox = canvas.translateOffsetX,
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY
      var pixels = {
        x: (coords.x / (1 / sx)) + p.x + s.width / 2 + ox,
        y: (coords.y / (1 / sy)) + p.y + s.height / 2 + oy
      }
      return pixels
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  },
  pixelsToCoords: function (pixels) {
    var coords
    if (Metamaps.Visualize.mGraph) {
      var canvas = Metamaps.Visualize.mGraph.canvas,
        s = canvas.getSize(),
        p = canvas.getPos(),
        ox = canvas.translateOffsetX,
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY
      coords = {
        x: (pixels.x - p.x - s.width / 2 - ox) * (1 / sx),
        y: (pixels.y - p.y - s.height / 2 - oy) * (1 / sy),
      }
    } else {
      coords = {
        x: 0,
        y: 0
      }
    }
    return coords
  },
  getPastelColor: function () {
    var r = (Math.round(Math.random() * 127) + 127).toString(16)
    var g = (Math.round(Math.random() * 127) + 127).toString(16)
    var b = (Math.round(Math.random() * 127) + 127).toString(16)
    return Metamaps.Util.colorLuminance('#' + r + g + b, -0.4)
  },
  // darkens a hex value by 'lum' percentage
  colorLuminance: function (hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '')
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    lum = lum || 0

    // convert to decimal and change luminosity
    var rgb = '#', c, i
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16)
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
      rgb += ('00' + c).substr(c.length)
    }

    return rgb
  },
  generateOptionsList: function (data) {
    var newlist = ''
    for (var i = 0; i < data.length; i++) {
      newlist = newlist + '<option value="' + data[i]['id'] + '">' + data[i]['1'][1] + '</option>'
    }
    return newlist
  },
  checkURLisImage: function (url) {
    // when the page reloads the following regular expression will be screwed up
    // please replace it with this one before you save: /*backslashhere*.(jpeg|jpg|gif|png)$/
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null)
  },
  checkURLisYoutubeVideo: function (url) {
    return (url.match(/^https?:\/\/(?:www\.)?youtube.com\/watch\?(?=[^?]*v=\w+)(?:[^\s?]+)?$/) != null)
  }
}; // end Metamaps.Util

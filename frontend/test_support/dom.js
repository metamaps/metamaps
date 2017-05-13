const jsdom = require('jsdom')
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
const win = doc.defaultView

global.document = doc
global.window = win

// take all properties of the window object and also attach it to the
// mocha global object
propagateToGlobal(win)

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal(window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue

    global[key] = window[key]
  }
}

// Metamaps dependencies fixes
global.HowlerGlobal = global.HowlerGlobal || { prototype: {} }
global.Howl = global.Howl || { prototype: {} }
global.Sound = global.Sound || { prototype: {} }

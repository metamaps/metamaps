/* global $ */

import Import from './Import'
import Util from './Util'
import Visualize from './Visualize'
import URL_REGEX from '../patched/regex-weburl'

const PasteInput = {
  init: function() {
    var self = PasteInput

    // intercept dragged files
    // see http://stackoverflow.com/questions/6756583
    window.addEventListener('dragover', function(e) {
      e = e || window.event
      e.preventDefault()
    }, false)
    window.addEventListener('drop', function(e) {
      e = e || window.event

      // prevent conflict with react-dropzone file uploader
      if (e.target.id !== 'infovis-canvas') return

      e.preventDefault()
      var coords = Util.pixelsToCoords(Visualize.mGraph, { x: e.clientX, y: e.clientY })
      if (e.dataTransfer.files.length > 0) {
        self.handleFile(e.dataTransfer.files[0], coords)
      }
      // OMG import bookmarks 😍 (Or just text :P)
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        e.dataTransfer.items[0].getAsString(function(text) {
          self.handle(text, coords)
        })
      }
    }, false)

    // allow pasting onto canvas (but don't break existing inputs/textareas)
    $('body').bind('paste', function(e) {
      if (e.target.tagName === 'INPUT') return
      if (e.target.tagName === 'TEXTAREA') return

      var text = e.originalEvent.clipboardData.getData('text/plain').trim()
      self.handle(text)
    })
  },

  handleFile: (file, coords = null) => {
    var self = PasteInput
    var fileReader = new window.FileReader()
    fileReader.readAsText(file)
    fileReader.onload = function(e) {
      var text = e.currentTarget.result
      if (text.substring(0, 5) === '<?xml') {
        // assume this is a macOS .webloc link
        text = text.replace(/[\s\S]*<string>(.*)<\/string>[\s\S]*/m, '$1')
      }
      self.handle(text, coords)
    }
  },

  handle: function(text, coords = {}) {
    var self = PasteInput

    if (text.match(URL_REGEX)) {
      Import.handleURL(text, coords)
    } else if (text[0] === '{') {
      Import.handleJSON(text)
    } else if (text.match(/^[Tt]opics\t/) || text.match(/^[Ss]ynapses\t/)) {
      Import.handleTSV(text)
    } else {
      // Handle as plain text
      let textItems = text.split('\n')
      if (textItems.length === 1) {
        if (textItems[0].trim() !== '') {
          Import.handleText(textItems[0].trim(), coords)
        }
      } else if (window.confirm('Are you sure you want to create ' + textItems.length + ' new topics?')) {
        textItems.forEach(item => {
          if (item.trim() !== '') {
            self.handle(item.trim(), coords)
          }
        })
      }
    }
  }
}

export default PasteInput

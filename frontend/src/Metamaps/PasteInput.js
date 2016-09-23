/* global $ */

import AutoLayout from './AutoLayout'
import Import from './Import'
import TopicCard from './TopicCard'
import Util from './Util'

const PasteInput = {
  // thanks to https://github.com/kevva/url-regex
  URL_REGEX: new RegExp('^(?:(?:(?:[a-z]+:)?//)|www\.)(?:\S+(?::\S*)?@)?(?:localhost|(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#][^\s"]*)?$'),

  init: function () {
    var self = PasteInput

    // intercept dragged files
    // see http://stackoverflow.com/questions/6756583
    window.addEventListener("dragover", function(e) {
      e = e || event;
      e.preventDefault();
    }, false);
    window.addEventListener("drop", function(e) {
      e = e || event;
      e.preventDefault();
      var coords = Util.pixelsToCoords({ x: e.clientX, y: e.clientY })
      if (e.dataTransfer.files.length > 0) {
        var fileReader = new FileReader()
        var text = fileReader.readAsText(e.dataTransfer.files[0])
        fileReader.onload = function(e) {
          var text = e.currentTarget.result
          if (text.substring(0,5) === '<?xml') {
            // assume this is a macOS .webloc link
            text = text.replace(/[\s\S]*<string>(.*)<\/string>[\s\S]*/m, '$1')
          }
          self.handle(text, coords)
        }
      }
      // OMG import bookmarks 😍
      if (e.dataTransfer.items.length > 0) {
        e.dataTransfer.items[0].getAsString(function(text) {
          if (text.match(self.URL_REGEX)) {
            self.handle(text, coords)
          }
        })
      }
    }, false);

    // allow pasting onto canvas (but don't break existing inputs/textareas)
    $('body').bind('paste', function (e) {
      if (e.target.tagName === 'INPUT') return
      if (e.target.tagName === 'TEXTAREA') return

      var text = e.originalEvent.clipboardData.getData('text/plain').trim()
      self.handle(text)
    })
  },

  handle: function(text, coords) {
    var self = PasteInput

    if (text.match(self.URL_REGEX)) {
      self.handleURL(text, coords)
    } else if (text[0] === '{') {
      Import.handleJSON(text)
    } else if (text.match(/\t/)) {
      Import.handleTSV(text)
    } else if (text.match(/","/)) {
      Import.handleCSV(text)
    }
  },

  handleURL: function (text, coords) {
    var title = 'Link'
    if (!coords || !coords.x || !coords.y) {
      coords = AutoLayout.getNextCoord()
    }

    var import_id = null  // don't store a cidMapping
    var permission = null // use default

    Import.createTopicWithParameters(
      title,
      'Reference', // metacode - todo fix
      permission,
      text, // desc - todo load from url?
      text, // link - todo fix because this isn't being POSTed
      coords.x,
      coords.y,
      import_id,
      {
        success: function(topic) {
          $.get('/hacks/load_url_title', {
            url: text
          }, function success(data, textStatus) {
            var selector = '#showcard #topic_' + topic.get('id') + ' .best_in_place'
            if ($(selector).find('form').length > 0) {
              $(selector).find('textarea, input').val(data.title)
            } else {
              $(selector).html(data.title)
            }
            topic.set('name', data.title)
            topic.save()
          })
          TopicCard.showCard(topic.get('node'), function() {
            $('#showcard #titleActivator').click()
              .find('textarea, input').focus()
          })
        }
      }
    )
  }
}

export default PasteInput

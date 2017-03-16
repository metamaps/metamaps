/* global $ */

import React from 'react'
import ReactDOM from 'react-dom'
import outdent from 'outdent'

import ImportDialogBox from '../../components/MapView/ImportDialogBox'

import PasteInput from '../PasteInput'
import Map from '../Map'

const ImportDialog = {
  openLightbox: null,
  closeLightbox: null,

  init: function(serverData, openLightbox, closeLightbox) {
    const self = ImportDialog
    self.openLightbox = openLightbox
    self.closeLightbox = closeLightbox

    $('#lightbox_content').append($(outdent`
      <div class="lightboxContent" id="import-dialog">
        <div class="importDialogWrapper" />
      </div>
    `))
    ReactDOM.render(React.createElement(ImportDialogBox, {
      onFileAdded: PasteInput.handleFile,
      exampleImageUrl: serverData['import-example.png'],
      downloadScreenshot: ImportDialog.downloadScreenshot,
      onExport: format => () => {
        window.open(`${window.location.pathname}/export.${format}`, '_blank')
      }
    }), $('.importDialogWrapper').get(0))
  },
  show: function() {
    ImportDialog.openLightbox('import-dialog')
  },
  hide: function() {
    ImportDialog.closeLightbox()
  },
  downloadScreenshot: function() {
    ImportDialog.hide()
    Map.offerScreenshotDownload()
  }
}

export default ImportDialog

/* global $ */

import React from 'react'
import ReactDOM from 'react-dom'
import outdent from 'outdent'

import ImportDialogBox from '../../components/ImportDialogBox'

import PasteInput from '../PasteInput'

const ImportDialog = {
  openLightbox: null,
  closeLightbox: null,

  init: function(serverData, openLightbox, closeLightbox) {
    const self = ImportDialog
    self.openLightbox = openLightbox
    self.closeLightbox = closeLightbox

    $('#lightbox_content').append($(outdent`
      <div class="lightboxContent" id="import-dialog-lightbox">
        <div class="importDialogWrapper" />
      </div>
    `))
    ReactDOM.render(React.createElement(ImportDialogBox, {
      onFileAdded: PasteInput.handleFile,
      exampleImageUrl: serverData['import-example.png']
    }), $('.importDialogWrapper').get(0))
  },
  show: function() {
    ImportDialog.openLightbox('import-dialog')
  },
  hide: function() {
    ImportDialog.closeLightbox('import-dialog')
  }
}

export default ImportDialog

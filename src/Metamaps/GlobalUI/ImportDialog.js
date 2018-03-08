/* global $ */

import Map from '../Map'

const ImportDialog = {
  openLightbox: null,
  closeLightbox: null,
  init: function(serverData, openLightbox, closeLightbox) {
    const self = ImportDialog
    self.openLightbox = openLightbox
    self.closeLightbox = closeLightbox
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

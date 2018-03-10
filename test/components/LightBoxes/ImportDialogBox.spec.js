/* global describe, it */
import React from 'react'
import ImportDialogBox from '../../../src/components/LightBoxes/ImportDialogBox.js'
import Dropzone from 'react-dropzone'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import sinon from 'sinon'

describe('ImportDialogBox', function() {
  const csvExport = sinon.spy()
  const jsonExport = sinon.spy()
  const onExport = format => () => {
    if (format === 'csv') {
      csvExport()
    } else if (format === 'json') {
      jsonExport()
    }
  }

  const testExportButton = ({ description, cssClass, exporter }) => {
    it(description, () => {
      const wrapper = shallow(<ImportDialogBox onExport={onExport} />)
      const button = wrapper.find(cssClass)
      expect(button).to.exist
      button.simulate('click')
      expect(exporter).to.have.property('callCount', 1)
    })
  }
  testExportButton({
    description: 'has an Export CSV button',
    cssClass: '.export-csv',
    exporter: csvExport
  })
  testExportButton({
    description: 'has an Export JSON button',
    cssClass: '.export-json',
    exporter: jsonExport
  })

  it('has a Download screenshot button', () => {
    const downloadScreenshot = sinon.spy()
    const wrapper = shallow(<ImportDialogBox onExport={() => null} downloadScreenshot={downloadScreenshot} />)
    const button = wrapper.find('.download-screenshot')
    expect(button).to.exist
    button.simulate('click')
    expect(downloadScreenshot).to.have.property('callCount', 1)
  })

  it('has a file uploader', () => {
    const uploadedFile = {}
    const onFileAdded = sinon.spy()
    const wrapper = shallow(<ImportDialogBox onExport={() => null} onFileAdded={onFileAdded} />)
    const dropzone = wrapper.find(Dropzone)
    dropzone.props().onDropAccepted([uploadedFile], { preventDefault: () => {} })
    expect(onFileAdded).to.have.property('callCount', 1)
    expect(onFileAdded.calledWith(uploadedFile)).to.equal(true)
  })
})

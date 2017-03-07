/* global describe, it */
import React from 'react'
import TestUtils from 'react-addons-test-utils' // ES6
import ImportDialogBox from '../../src/components/ImportDialogBox.js'
import Dropzone from 'react-dropzone'
import chai from 'chai'

const { expect } = chai

describe('ImportDialogBox', function() {
  it('has an Export CSV button', function(done) {
    const onExport = format => {
      if (format === 'csv') done()
    }
    const detachedComp = TestUtils.renderIntoDocument(<ImportDialogBox onExport={onExport} />)
    const button = TestUtils.findRenderedDOMComponentWithClass(detachedComp, 'export-csv')
    const buttonNode = React.findDOMNode(button)
    expect(button).to.exist;
    TestUtils.Simulate.click(buttonNode)
  })

  it('has an Export JSON button', function(done) {
    const onExport = format => {
      if (format === 'json') done()
    }
    const detachedComp = TestUtils.renderIntoDocument(<ImportDialogBox onExport={onExport} />)
    const button = TestUtils.findRenderedDOMComponentWithClass(detachedComp, 'export-json')
    const buttonNode = React.findDOMNode(button)
    expect(button).to.exist;
    TestUtils.Simulate.click(buttonNode)
  })

  it('has a Download screenshot button', function(done) {
    const downloadScreenshot = () => { done() }
    const detachedComp = TestUtils.renderIntoDocument(<ImportDialogBox downloadScreenshot={downloadScreenshot()} />)
    const button = TestUtils.findRenderedDOMComponentWithClass(detachedComp, 'download-screenshot')
    const buttonNode = React.findDOMNode(button)
    expect(button).to.exist;
    TestUtils.Simulate.click(buttonNode)
  })

  it('has a file uploader', function(done) {
    const uploadedFile = { file: 'mock a file' }
    const onFileAdded = file => { if (file === uploadedFile) done() }
    const detachedComp = TestUtils.renderIntoDocument(<ImportDialogBox onExport={() => {}} onFileAdded={onFileAdded} />)
    const dropzone = TestUtils.findRenderedComponentWithType(detachedComp, Dropzone)
    expect(dropzone).to.exist;
    dropzone.props.onDropAccepted([uploadedFile], { preventDefault: () => {} })
  })
})

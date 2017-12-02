/* global describe, it */
import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import { RIETextArea } from 'riek'

import Title from '../../../src/components/TopicCard/Title.js'

function render(props) {
  return shallow(<Title {...props} />)
}

const name = 'name 1'

function assertParentTitleSpan(wrapper) {
  it('wraps everything in span.title', function() {
    expect(wrapper.props().className).to.equal('title')
    expect(wrapper.type()).to.equal('span')
  })
}

describe('Title', function() {
  describe('not authorized to edit', function() {
    const wrapper = render({ authorizedToEdit: false, name })

    assertParentTitleSpan(wrapper)

    it('renders the name in span.titleWrapper', function() {
      expect(wrapper.find('.titleWrapper').text()).to.have.string(name)
      expect(wrapper.find('.titleWrapper').type()).to.equal('span')
    })
  })

  describe('authorized to edit', function() {
    const onChange = sinon.spy()
    const wrapper = render({ authorizedToEdit: true, onChange, name })
    const textArea = wrapper.find('.titleWrapper')

    assertParentTitleSpan(wrapper)

    it('renders RIETextArea with correct value', function() {
      expect(textArea.type()).to.equal(RIETextArea)
      expect(textArea.props().value).to.equal(name)
    })

    it('RIETextArea props are correct', function() {
      expect(textArea.props().id).to.equal('titleActivator')
      expect(textArea.props().classEditing).to.equal('riek-editing')
    })

    it('calls onChange on Enter', function() {
      // simulate pressing Enter
      textArea.props().editProps.onKeyPress({
        which: 13, preventDefault: () => {}, target: { value: 'new name' }
      })

      expect(onChange.calledOnce).to.equal(true)
      expect(onChange.calledWithExactly({ name: 'new name' }))
    })

    it('renders a namecounter', function() {
      expect(wrapper.find('.nameCounter').props().className).to.equal('nameCounter')
      expect(wrapper.find('.nameCounter').text()).to.have.string(`${name.length}/140`)
    })
  })
})

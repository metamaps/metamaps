/* global describe, it */
import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import Desc from '../../../src/components/TopicCard/Desc.js'

function render(props) {
  return shallow(<Desc {...props} />)
}

function sharedAssertions(wrapper, desc, { descProp }) {
  it('renders the correct wrapping html', function() {
    expect(wrapper.find('.scroll').length).to.equal(1)
    expect(wrapper.find('.scroll').find('.desc').length).to.equal(1)
  })
  it('renders the description', function() {
    expect(wrapper
      .find('.scroll')
      .find('.desc')
      .find('.riek_desc')
      .prop(descProp)).to.equal(desc)
  })
}

describe('TopicCard/Desc', function() {
  const desc = 'sample description'
  describe('not authorized to edit', function() {
    const wrapper = render({ authorizedToEdit: false, desc })
    sharedAssertions(wrapper, desc, { descProp: 'children' })
  })

  describe('authorized to edit', function() {
    const onChange = sinon.spy()
    const wrapper = render({ authorizedToEdit: true, desc, onChange })
    sharedAssertions(wrapper, desc, { descProp: 'value' })

    it('renders mdSupport', function() {
      const mdSupport = wrapper.find('.desc').childAt(1)
      expect(mdSupport.prop('className')).to.equal('mdSupport')
      expect(mdSupport.prop('href')).to.include('commonmark.org/help')
      expect(mdSupport.prop('target')).to.equal('_blank')
    })

    it('renders clearfloat', function() {
      const clearfloat = wrapper.find('.desc').childAt(2)
      expect(clearfloat.prop('className')).to.equal('clearfloat')
    })

    const textArea = wrapper.find('.riek_desc')
    it('has the correct classEditing', function() {
      expect(textArea.prop('classEditing')).to.equal('riek-editing')
    })
    it('has 6 rows', function() {
      expect(textArea.prop('rows')).to.equal('6')
    })

    describe('defaultProps', function() {
      describe('desc is present', function() {
        const textArea = render({
          authorizedToEdit: true, desc: '**sample description 2**'
        }).find('.riek_desc')

        // TODO I'd prefer to be mocking Util.mdToHTML
        it('converts markdown to html', function() {
          expect(textArea.prop('defaultProps').dangerouslySetInnerHTML.__html)
            .to.equal('<p><strong>sample description 2</strong></p>\n')
        })
      })
      describe('desc is not present', function() {
        const textArea = render({ authorizedToEdit: true, desc: null })
          .find('.riek_desc')
        it('renders placeholder message', function() {
          expect(textArea.prop('defaultProps').dangerouslySetInnerHTML.__html)
            .to.equal('<p class="emptyDesc">Edit the description... (supports markdown)</p>')
        })
      })
    })

    describe('editProps', function() {
      const ENTER = 13
      const target = { value: 'new value' }
      it('does not call onChange on Shift+Enter', function() {
        textArea.prop('editProps').onKeyPress({
          shiftKey: true, which: ENTER
        })
        expect(onChange.notCalled).to.equal(true)
      })

      it('calls onChange on ENTER', function() {
        textArea.prop('editProps').onKeyPress({
          which: ENTER, preventDefault: () => {}, target
        })
        expect(onChange.calledWith({ desc: 'new value' })).to.equal(true)
      })
    })
  })
})

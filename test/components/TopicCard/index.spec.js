/* global describe, it */
import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import ReactTopicCard from '../../../src/components/TopicCard/index.js'
import Links from '../../../src/components/TopicCard/Links.js'
import Title from '../../../src/components/TopicCard/Title.js'
import Desc from '../../../src/components/TopicCard/Desc.js'
import Attachments from '../../../src/components/TopicCard/Attachments.js'
import Info from '../../../src/components/TopicCard/Info.js'

const currentUser = { current: 'user' }

function render(props) {
  return shallow(<ReactTopicCard {...props} currentUser={currentUser} />)
}

function mockTopic({ hasAttachment, canEdit, isOwner }) {
  const get = sinon.stub()
  if (hasAttachment) {
    get.withArgs('link').returns('https://www.google.ca')
  } else {
    get.withArgs('link').returns('')
  }

  const authorizeToEdit = sinon.stub()
  authorizeToEdit.withArgs(currentUser).returns(canEdit)

  const authorizePermissionChange = sinon.stub()
  authorizePermissionChange.withArgs(currentUser).returns(isOwner)

  return {
    get,
    authorizeToEdit,
    authorizePermissionChange
  }
}

function assertCssClassPresent({ mockTopicParam, mockTopicValue, cssClass }) {
  const topic = mockTopic({ [mockTopicParam]: mockTopicValue })
  const wrapper = render({ openTopic: topic })
  it(`correctly shows ${cssClass} css class`, function() {
    expect(wrapper.find(`.${cssClass}`).length).to.equal(1)
  })
}

describe('TopicCard', function() {
  describe('topic is null', function() {
    const wrapper = render({ openTopic: null })
    it('returns null', function() {
      expect(wrapper.type()).to.be.null
    })
  })

  describe('has attachment', function() {
    assertCssClassPresent({ mockTopicParam: 'hasAttachment', mockTopicValue: true, cssClass: 'hasAttachment' })
  })

  describe('authorized to edit', function() {
    assertCssClassPresent({ mockTopicParam: 'canEdit', mockTopicValue: true, cssClass: 'canEdit' })
  })

  describe('not authorized to edit', function() {
    assertCssClassPresent({ mockTopicParam: 'canEdit', mockTopicValue: false, cssClass: 'cannotEdit' })
  })

  describe('topic is owned by current user', function() {
    assertCssClassPresent({ mockTopicParam: 'isOwner', mockTopicValue: true, cssClass: 'yourTopic' })
  })

  describe('Draggable wrapper', function() {
    const wrapper = render({ openTopic: mockTopic({}) })
    it('handle is metacodeImage', function() {
      expect(wrapper.props().handle).to.equal('.metacodeImage')
    })
    it('default position is 100, 100', function() {
      expect(wrapper.props().defaultPosition.x).to.equal(100)
      expect(wrapper.props().defaultPosition.y).to.equal(100)
    })
  })

  describe('content', function() {
    const wrapper = render({ openTopic: mockTopic({}) })
    const innerDiv = wrapper.find('.CardOnGraph')
    it('renders a Links component', function() {
      expect(innerDiv.childAt(0).type()).to.equal(Links)
    })
    it('renders a Title component', function() {
      expect(innerDiv.childAt(1).type()).to.equal(Title)
    })
    it('renders a Desc component', function() {
      expect(innerDiv.childAt(2).type()).to.equal(Desc)
    })
    it('renders a Attachments component', function() {
      expect(innerDiv.childAt(3).type()).to.equal(Attachments)
    })
    it('renders a Info component', function() {
      expect(innerDiv.childAt(4).type()).to.equal(Info)
    })
    it('renders a clearfloat div at the end', function() {
      const div = innerDiv.childAt(5)
      expect(div.type()).to.equal('div')
      expect(div.props().className).to.have.string('clearfloat')
    })
  })
})

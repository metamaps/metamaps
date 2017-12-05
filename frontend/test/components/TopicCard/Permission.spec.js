/* global describe, it */
import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import PermissionWrapper, { Permission } from '../../../src/components/TopicCard/Permission.js'

function render(props) {
  return shallow(<Permission {...props} />)
}

function sharedAssertions(permission) {
  describe(permission, function() {
    const shortname = permission === 'commons' ? 'co'
      : permission === 'public' ? 'pu'
      : permission === 'private' ? 'pr'
      : new Error('invalid permission')
    const wrapper = render({ permission })

    it('has the correct css classes', function() {
      expect(wrapper.find(`.${shortname}`).props().className).to.include('linkItem')
      expect(wrapper.find(`.${shortname}`).props().className).to.include('mapPerm')
    })
    it('sets the title', function() {
      expect(wrapper.find(`.${shortname}`).props().title).to.include(permission)
    })
    it('has correct permission select options', function() {
      expect(wrapper.find('.permissionSelect').find('.commons').length)
        .to.equal(permission === 'commons' ? 0 : 1)
      expect(wrapper.find('.permissionSelect').find('.public').length)
        .to.equal(permission === 'public' ? 0 : 1)
      expect(wrapper.find('.permissionSelect').find('.private').length)
        .to.equal(permission === 'private' ? 0 : 1)
    })
  })
}

describe('TopicCard/Permission', function() {
  sharedAssertions('commons')
  sharedAssertions('public')
  sharedAssertions('private')

  describe('not authorizedToEdit', function() {
    const togglePermissionSelect = sinon.spy()
    const wrapper = render({
      permission: 'commons', authorizedToEdit: false, togglePermissionSelect
    })

    it('hides the permissionSelect div', function() {
      expect(wrapper.find('.permissionSelect').props().style.display)
        .to.equal('none')
    })
    it("doesn't open the permissionSelect div", function() {
      wrapper.find('.linkItem').simulate('click')
      expect(togglePermissionSelect.notCalled).to.equal(true)
      expect(wrapper.state().selectingPermission).to.equal(false)
    })
  })

  describe('authorizedToEdit', function() {
    const updateTopic = sinon.spy()
    const wrapper = render({
      permission: 'commons', authorizedToEdit: true, updateTopic
    })

    it('opens the permissionSelect div', function() {
      wrapper.setState({ selectingPermission: false })

      wrapper.find('.linkItem').simulate('click')

      expect(wrapper.state().selectingPermission).to.equal(true)
    })

    it('updates the topic permissions', function() {
      wrapper.setState({ selectingPermission: true })

      wrapper.find('.permissionSelect').find('.public').simulate('click', {
        preventDefault: () => {}
      })

      expect(wrapper.state().selectingPermission).to.equal(false)
      expect(updateTopic.calledWith({
        permission: 'public', defer_to_map_id: null
      })).to.equal(true)
    })
  })
})

describe('PermissionWrapper', function() {
  const wrapper = shallow(<PermissionWrapper />)
  it('wraps Permission component in onclickoutside', function() {
    expect(wrapper.type()).to.equal(Permission)
  })
})

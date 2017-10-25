/* global describe, it */
import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import InfoAndHelp from '../../src/components/InfoAndHelp.js'
import MapInfoBox from '../../src/routes/MapView/MapInfoBox.js'

function assertTooltip({ wrapper, description, cssClass, tooltipText, callback }) {
  it(description, function() {
    expect(wrapper.find(cssClass)).to.exist
    expect(wrapper.find(`${cssClass} .tooltipsAbove`).text()).to.equal(tooltipText)
    wrapper.find(cssClass).simulate('click')
    expect(callback).to.have.property('callCount', 1)
  })
}

function assertContent({ currentUser, map }) {
  const onInfoClick = sinon.spy()
  const onHelpClick = sinon.spy()
  const onStarClick = sinon.spy()
  const wrapper = shallow(
    <InfoAndHelp map={map} currentUser={currentUser}
      onInfoClick={onInfoClick}
      onHelpClick={onHelpClick}
      onMapStar={onStarClick}
      mapIsStarred={false}
    />)

  if (map) {
    it('renders MapInfoBox', () => expect(wrapper.find(MapInfoBox)).to.exist)
    assertTooltip({
      wrapper,
      description: 'renders Map Info icon',
      cssClass: '.mapInfoIcon',
      tooltipText: 'Map Info',
      callback: onInfoClick
    })
  } else {
    it('does not render MapInfoBox', () => expect(wrapper.find(MapInfoBox).length).to.equal(0))
    it('does not render Map Info icon', () => expect(wrapper.find('.mapInfoIcon').length).to.equal(0))
  }

  if (map && currentUser) {
    it('renders Star icon', () => {
      expect(wrapper.find('.starMap')).to.exist
      wrapper.find('.starMap').simulate('click')
      expect(onStarClick).to.have.property('callCount', 1)
    })
  } else {
    it('does not render the Star icon', () => expect(wrapper.find('.starMap').length).to.equal(0))
  }

  // common content
  assertTooltip({
    wrapper,
    description: 'renders Help icon',
    cssClass: '.openCheatsheet',
    tooltipText: 'Help',
    callback: onHelpClick
  })
  it('renders clearfloat at the end', function() {
    const clearfloat = wrapper.find('.clearfloat')
    expect(clearfloat).to.exist
    expect(wrapper.find('.infoAndHelp').children().last()).to.eql(clearfloat)
  })
}

function assertStarLogic({ mapIsStarred }) {
  const onMapStar = sinon.spy()
  const onMapUnstar = sinon.spy()
  const wrapper = shallow(
    <InfoAndHelp map={{}} currentUser={{}}
      onMapStar={onMapStar}
      onMapUnstar={onMapUnstar}
      mapIsStarred={mapIsStarred}
    />)
  const starWrapper = wrapper.find('.starMap')
  starWrapper.simulate('click')
  it(mapIsStarred ? 'has unstar content' : 'has star content', () => {
    expect(starWrapper.hasClass('starred')).to.equal(mapIsStarred)
    expect(starWrapper.find('.tooltipsAbove').text()).to.equal(mapIsStarred ? 'Unstar' : 'Star')
    expect(onMapStar).to.have.property('callCount', mapIsStarred ? 0 : 1)
    expect(onMapUnstar).to.have.property('callCount', mapIsStarred ? 1 : 0)
  })
}

describe('InfoAndHelp', function() {
  describe('no currentUser, map is present', function() {
    assertContent({ currentUser: null, map: {} })
  })
  describe('currentUser is present, map is present', function() {
    assertContent({ currentUser: {}, map: {} })
  })
  describe('no currentUser, no map', function() {
    assertContent({ currentUser: null, map: null })
  })
  assertStarLogic({ mapIsStarred: true })
  assertStarLogic({ mapIsStarred: false })
})

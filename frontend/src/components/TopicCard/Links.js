/* global $ */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import MetacodeSelect from '../MetacodeSelect'
import Permission from './Permission'

class Links extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showMetacodeTitle: false,
      showMetacodeSelect: false,
      showInMaps: false,
      showMoreMaps: false,
      hoveringMapCount: false,
      hoveringSynapseCount: false
    }
  }

  handleMetacodeSelect = metacodeId => {
    this.setState({ showMetacodeSelect: false })
    this.props.updateTopic({
      metacode_id: metacodeId
    })
    // this needs to trigger a redraw of the canvas,
    // which it currently does using backbone. If backbone comes out, make sure it still does
  }

  toggleShowMoreMaps = e => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ showMoreMaps: !this.state.showMoreMaps })
  }

  updateState = (key, value) => () => {
    this.setState({ [key]: value })
  }

  inMaps = (topic) => {
    const inmapsArray = topic.get('inmaps') || []
    const inmapsLinks = topic.get('inmapsLinks') || []

    let firstFiveLinks = []
    let extraLinks = []
    for (let i = 0; i < inmapsArray.length; i ++) {
      if (i < 5) {
        firstFiveLinks.push({ mapName: inmapsArray[i], mapId: inmapsLinks[i] })
      } else {
        extraLinks.push({ mapName: inmapsArray[i], mapId: inmapsLinks[i] })
      }
    }

    let output = []

    firstFiveLinks.forEach(obj => {
      output.push(<li key={obj.mapId}><Link to={`/maps/${obj.mapId}`}>{obj.mapName}</Link></li>)
    })

    if (extraLinks.length > 0) {
      if (this.state.showMoreMaps) {
        extraLinks.forEach(obj => {
          output.push(<li key={obj.mapId} className="hideExtra extraText"><Link to={`/maps/${obj.mapId}`}>{obj.mapName}</Link></li>)
        })
      }
      const text = this.state.showMoreMaps ? 'See less...' : `See ${extraLinks.length} more...`
      output.push(<li key="showMore"><span className="showMore" onClick={this.toggleShowMoreMaps}>{text}</span></li>)
    }

    return output
  }

  handleMetacodeBarClick = () => {
    if (this.state.showMetacodeTitle) {
      this.setState({ showMetacodeSelect: !this.state.showMetacodeSelect })
    }
  }

  render = () => {
    const { topic, ActiveMapper } = this.props
    const authorizedToEdit = topic.authorizeToEdit(ActiveMapper)
    const authorizedPermissionChange = topic.authorizePermissionChange(ActiveMapper)
    const metacode = topic.getMetacode()

    return (
      <div className="links">
        <div className="linkItem icon metacodeItem"
          style={{ zIndex: this.state.showMetacodeTitle ? 4 : 1 }}
          onMouseLeave={() => this.setState({ showMetacodeTitle: false, showMetacodeSelect: false })}
          onClick={() => authorizedToEdit && this.handleMetacodeBarClick()}
        >
          <div className={`metacodeTitle mbg${metacode.get('id')}`}
            style={{ display: this.state.showMetacodeTitle ? 'block' : 'none' }}
          >
            {metacode.get('name')}
            <div className="expandMetacodeSelect"/>
          </div>
          <div className="metacodeImage"
            style={{backgroundImage: `url(${metacode.get('icon')})`}}
            title="click and drag to move card"
            onMouseEnter={() => this.setState({ showMetacodeTitle: true })}
          />
          <div className="metacodeSelect"
            style={{ display: this.state.showMetacodeSelect ? 'block' : 'none' }}
          >
            <MetacodeSelect onMetacodeSelect={this.handleMetacodeSelect} metacodeSets={this.props.metacodeSets} />
          </div>
        </div>
        <div className="linkItem contributor">
          <a href={`/explore/mapper/${topic.get('user_id')}`} target="_blank"><img src={topic.get('user_image')} className="contributorIcon" width="32" height="32" /></a>
          <div className="contributorName">{topic.get('user_name')}</div>
        </div>
        <div className="linkItem mapCount"
          onMouseOver={this.updateState('hoveringMapCount', true)}
          onMouseOut={this.updateState('hoveringMapCount', false)}
          onClick={this.updateState('showInMaps', !this.state.showInMaps)}
        >
          <div className="mapCountIcon"></div>
          {topic.get('map_count').toString()}
          {!this.state.showInMaps && this.state.hoveringMapCount && (
            <div className="hoverTip">Click to see which maps topic appears on</div>
          )}
          {this.state.showInMaps && <div className="tip"><ul>{this.inMaps(topic)}</ul></div>}
        </div>
        <a href={`/topics/${topic.id}`}
          target="_blank"
          className="linkItem synapseCount"
          onMouseOver={this.updateState('hoveringSynapseCount', true)}
          onMouseOut={this.updateState('hoveringSynapseCount', false)}
        >
          <div className="synapseCountIcon"></div>
          {topic.get('synapse_count').toString()}
          {this.state.hoveringSynapseCount && <div className="tip">Click to see this topics synapses</div>}
        </a>
        <Permission
          permission={topic.get('permission')}
          authorizedToEdit={authorizedPermissionChange}
          updateTopic={this.props.updateTopic}
        />
        <div className="clearfloat"></div>
      </div>
    )
  }
}

Links.propTypes = {
  topic: PropTypes.object, // backbone object
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func,
  metacodeSets: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    metacodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      icon_path: PropTypes.string, // url
      name: PropTypes.string
    }))
  }))
}

export default Links

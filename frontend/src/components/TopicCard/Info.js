/* global $ */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

class Info extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showInMaps: false,
      showMoreMaps: false,
      hoveringMapCount: false,
      hoveringSynapseCount: false
    }
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
    for (let i = 0; i < inmapsArray.length; i++) {
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

  render = () => {
    const { topic } = this.props

    return (
      <div className="info">
        <div className="linkItem contributor">
                <a href={`/explore/mapper/${topic.get('user_id')}`} target="_blank">
                  <img src={topic.get('user_image')} className="contributorIcon" width="32" height="32" />
                  <div className="contributorName">{topic.get('user_name')}</div>
                </a>
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
        <div className="clearfloat"></div>
      </div>
    )
  }
}

Info.propTypes = {
  topic: PropTypes.object // backbone object
}

export default Info

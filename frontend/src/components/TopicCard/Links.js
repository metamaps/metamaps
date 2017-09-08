/* global $ */

import React, { PropTypes, Component } from 'react'
import { Link } from 'react-router'

import MetacodeSelect from '../MetacodeSelect'
import Permission from './Permission'
import Follow from './Follow'

class Links extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showMetacodeSelect: false
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

  handleMetacodeBarClick = () => {
    if (this.state.showMetacodeTitle) {
      this.setState({ showMetacodeSelect: !this.state.showMetacodeSelect })
    }
  }

  render = () => {
    const { topic, onTopicFollow, ActiveMapper } = this.props
    const authorizedToEdit = topic.authorizeToEdit(ActiveMapper)
    const authorizedPermissionChange = topic.authorizePermissionChange(ActiveMapper)
    const metacode = topic.getMetacode()
    const wrappedTopicFollow = () => onTopicFollow(topic)
    const isFollowing = topic.isFollowedBy(ActiveMapper)

    return (
      <div className="links">
        <div className="linkItem icon metacodeItem"
          onClick={() => authorizedToEdit && this.handleMetacodeBarClick()}
        >
          <div className={`metacodeTitle mbg${metacode.get('id')}`}>
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
        <Permission
          permission={topic.get('permission')}
          authorizedToEdit={authorizedPermissionChange}
          updateTopic={this.props.updateTopic}
        />
        <Follow isFollowing={isFollowing} onTopicFollow={wrappedTopicFollow} />
        <div className="clearfloat"></div>
      </div>
    )
  }
}

Links.propTypes = {
  topic: PropTypes.object, // backbone object
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func,
  onTopicFollow: PropTypes.func,
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

import React, { Component } from 'react'
import PropTypes from 'prop-types'

class MapInfoBox extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    map: PropTypes.object,
    infoBoxHtml: PropTypes.string
  }

  render () {
    const { currentUser, map, infoBoxHtml } = this.props
    if (!map) return null
    const html = {__html: infoBoxHtml}
    const isCreator = map.authorizePermissionChange(currentUser)
    const canEdit = map.authorizeToEdit(currentUser)
    let classes = 'mapInfoBox mapElement mapElementHidden permission '
    classes += isCreator ? 'yourMap' : ''
    classes += canEdit ? ' canEdit' : ''
    return <div className={classes} dangerouslySetInnerHTML={html}></div>
  }
}

export default MapInfoBox

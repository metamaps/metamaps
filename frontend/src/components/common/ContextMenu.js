import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MetacodeSelect from '../MetacodeSelect'

class ContextMenu extends Component {
  static propTypes = {
    topicId: PropTypes.string,
    mapId: PropTypes.string,
    currentUser: PropTypes.object,
    map: PropTypes.object,
    contextNode: PropTypes.object,
    contextEdge: PropTypes.object,
    contextPos: PropTypes.object,
    contextFetchingSiblingsData: PropTypes.bool,
    contextSiblingsData: PropTypes.object,
    metacodeSets: PropTypes.array,
    contextDelete: PropTypes.func,
    contextRemove: PropTypes.func,
    contextHide: PropTypes.func,
    contextCenterOn: PropTypes.func,
    contextPopoutTopic: PropTypes.func,
    contextUpdatePermissions: PropTypes.func,
    contextOnMetacodeSelect: PropTypes.func,
    contextFetchSiblings: PropTypes.func,
    contextPopulateSiblings: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      populateSiblingsSent: false
    }
  }

  render () {
    const { contextNode, contextPos, contextOnMetacodeSelect, metacodeSets,
            contextDelete, contextHide, contextRemove, contextCenterOn,
            contextPopoutTopic, contextSiblingsData, contextFetchSiblings,
            currentUser, contextPopulateSiblings, contextFetchingSiblingsData,
            topicId, map, mapId, contextUpdatePermissions } = this.props

    const canEditMap = map && map.authorizeToEdit(currentUser)
    const style = {
      position: 'absolute',
      top: contextPos.y + 'px',
      left: contextPos.x + 'px'
    }

    const populateSiblings = () => {
      if (!this.state.populateSiblingsSent) {
        contextPopulateSiblings(contextNode.id)
        this.setState({populateSiblingsSent: true})
      }
    }

    return <div className="rightclickmenu" style={style}>
      <ul>
        <li className="rc-hide" onClick={contextHide}>
          <div className="rc-icon" />Hide until refresh
            <div className="rc-keyboard">Ctrl+H</div>
        </li>
        {canEditMap && <li className="rc-remove" onClick={contextRemove}>
          <div className="rc-icon" />Remove from map
            <div className="rc-keyboard">Ctrl+M</div>
        </li>}
        {canEditMap && <li className="rc-delete" onClick={contextDelete}>
          <div className="rc-icon" />Delete
            <div className="rc-keyboard">Ctrl+D</div>
        </li>}
        {contextNode && topicId && <li className="rc-center"
          onClick={() => contextCenterOn(contextNode.id)}>
          <div className="rc-icon" />Center this topic
          <div className="rc-keyboard">Alt+E</div>
        </li>}
        {contextNode && <li className="rc-popout"
          onClick={() => contextPopoutTopic(contextNode.id)}>
          <div className="rc-icon" />Open in new tab
        </li>}
        {(currentUser || (contextNode && topicId)) && <li className="rc-spacer">
        </li>}
        {currentUser && <li className="rc-permission">
          <div className="rc-icon" />Change permissions
          <ul>
            <li className="changeP toCommons"
              onClick={() => contextUpdatePermissions('commons')}>
              <div className="rc-perm-icon" />commons
            </li>
            <li className="changeP toPublic"
              onClick={() => contextUpdatePermissions('public')}>
              <div className="rc-perm-icon" />public
            </li>
            <li className="changeP toPrivate"
              onClick={() => contextUpdatePermissions('private')}>
              <div className="rc-perm-icon" />private
            </li>
          </ul>
          <div className="expandLi" />
        </li>}
        {currentUser && <li className="rc-metacode">
          <div className="rc-icon" />Change metacode
          <div id="metacodeOptionsWrapper">
            <MetacodeSelect
              onMetacodeSelect={id => {
                contextOnMetacodeSelect(contextNode && contextNode.id, id)
              }}
              metacodeSets={metacodeSets} />
          </div>
          <div className="expandLi" />
        </li>}
        {contextNode && topicId && <li className="rc-siblings"
            onMouseOver={populateSiblings}>
          <div className="rc-icon" />Reveal siblings
          <ul id="fetchSiblingList">
            <li className="fetchAll"
              onClick={() => contextFetchSiblings(contextNode)}>All
              <div className="rc-keyboard">Alt+R</div>
            </li>
            {contextSiblingsData && Object.keys(contextSiblingsData).map(key => {
              return <li key={key}
                onClick={() => contextFetchSiblings(contextNode, key)}>
                {contextSiblingsData[key]}
              </li>
            })}
            {contextFetchingSiblingsData && <li id="loadingSiblings">loading...</li>}
          </ul>
          <div className="expandLi" />
        </li>}
      </ul>
    </div>

    // position the menu where the click happened
    /*const position = {}
    const RIGHTCLICK_WIDTH = 300
    const RIGHTCLICK_HEIGHT = 144 // this does vary somewhat, but we can use static
    const SUBMENUS_WIDTH = 256
    const MAX_SUBMENU_HEIGHT = 270
    const windowWidth = $(window).width()
    const windowHeight = $(window).height()

    if (windowWidth - e.clientX < SUBMENUS_WIDTH) {
      position.right = windowWidth - e.clientX
      $(rightclickmenu).addClass('moveMenusToLeft')
    } else if (windowWidth - e.clientX < RIGHTCLICK_WIDTH) {
      position.right = windowWidth - e.clientX
    } else if (windowWidth - e.clientX < RIGHTCLICK_WIDTH + SUBMENUS_WIDTH) {
      position.left = e.clientX
      $(rightclickmenu).addClass('moveMenusToLeft')
    } else {
      position.left = e.clientX
    }

    if (windowHeight - e.clientY < MAX_SUBMENU_HEIGHT) {
      position.bottom = windowHeight - e.clientY
      $(rightclickmenu).addClass('moveMenusUp')
    } else if (windowHeight - e.clientY < RIGHTCLICK_HEIGHT + MAX_SUBMENU_HEIGHT) {
      position.top = e.clientY
      $(rightclickmenu).addClass('moveMenusUp')
    } else {
      position.top = e.clientY
    }*/
  }
}

export default ContextMenu

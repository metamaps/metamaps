import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MetacodeSelect from './MetacodeSelect'

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

  getPositionData = () => {
    const { contextPos } = this.props
    let extraClasses = []
    const position = {}
    // TODO: make these dynamic values so that the ContextMenu can
    // change height and still work properly
    const RIGHTCLICK_WIDTH = 300
    const RIGHTCLICK_HEIGHT = 144 // this does vary somewhat, but we can use static
    const SUBMENUS_WIDTH = 256
    const MAX_SUBMENU_HEIGHT = 270
    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight

    if (windowWidth - contextPos.x < SUBMENUS_WIDTH) {
      position.right = windowWidth - contextPos.x
      extraClasses.push('moveMenusToLeft')
    } else if (windowWidth - contextPos.x < RIGHTCLICK_WIDTH) {
      position.right = windowWidth - contextPos.x
    } else if (windowWidth - contextPos.x < RIGHTCLICK_WIDTH + SUBMENUS_WIDTH) {
      position.left = contextPos.x
      extraClasses.push('moveMenusToLeft')
    } else {
      position.left = contextPos.x
    }

    if (windowHeight - contextPos.y < MAX_SUBMENU_HEIGHT) {
      position.bottom = windowHeight - contextPos.y
      extraClasses.push('moveMenusUp')
    } else if (windowHeight - contextPos.y < RIGHTCLICK_HEIGHT + MAX_SUBMENU_HEIGHT) {
      position.top = contextPos.y
      extraClasses.push('moveMenusUp')
    } else {
      position.top = contextPos.y
    }
    return {
      pos: {
        top: position.top && position.top + 'px',
        bottom: position.bottom && position.bottom + 'px',
        left: position.left && position.left + 'px',
        right: position.right && position.right + 'px'
      },
      extraClasses
    }
  }

  hide = () => {
    const { contextHide } = this.props
    return <li className='rc-hide' onClick={contextHide}>
      <div className='rc-icon' />
      Hide until refresh
      <div className='rc-keyboard'>Ctrl+H</div>
    </li>
  }

  remove = () => {
    const { contextRemove, map, currentUser } = this.props
    const canEditMap = map && map.authorizeToEdit(currentUser)
    if (!canEditMap) {
      return null
    }
    return <li className='rc-remove' onClick={contextRemove}>
      <div className='rc-icon' />
      Remove from map
      <div className='rc-keyboard'>Ctrl+M</div>
    </li>
  }

  delete = () => {
    const { contextDelete, map, currentUser } = this.props
    const canEditMap = map && map.authorizeToEdit(currentUser)
    if (!canEditMap) {
      return null
    }
    return <li className='rc-delete' onClick={contextDelete}>
      <div className='rc-icon' />
      Delete
      <div className='rc-keyboard'>Ctrl+D</div>
    </li>
  }

  center = () => {
    const { contextCenterOn, contextNode, topicId } = this.props
    if (!(contextNode && topicId)) {
      return null
    }
    return <li className='rc-center'
      onClick={() => contextCenterOn(contextNode.id)}>
      <div className='rc-icon' />
      Center this topic
      <div className='rc-keyboard'>Alt+E</div>
    </li>
  }

  popout = () => {
    const { contextPopoutTopic, contextNode } = this.props
    if (!contextNode) {
      return null
    }
    return <li className='rc-popout'
      onClick={() => contextPopoutTopic(contextNode.id)}>
      <div className='rc-icon' />
      Open in new tab
    </li>
  }

  permission = () => {
    const { currentUser, contextUpdatePermissions } = this.props
    if (!currentUser) {
      return null
    }
    return <li className='rc-permission'>
      <div className='rc-icon' />
      Change permissions
      <ul>
        <li className='changeP toCommons'
          onClick={() => contextUpdatePermissions('commons')}>
          <div className='rc-perm-icon' />
          commons
        </li>
        <li className='changeP toPublic'
          onClick={() => contextUpdatePermissions('public')}>
          <div className='rc-perm-icon' />
          public
        </li>
        <li className='changeP toPrivate'
          onClick={() => contextUpdatePermissions('private')}>
          <div className='rc-perm-icon' />
          private
        </li>
      </ul>
      <div className='expandLi' />
    </li>
  }

  metacode = () => {
    const { metacodeSets, contextOnMetacodeSelect,
            currentUser, contextNode } = this.props
    if (!currentUser) {
      return null
    }
    return <li className='rc-metacode'>
      <div className='rc-icon' />
      Change metacode
      <div id='metacodeOptionsWrapper'>
        <MetacodeSelect
          onMetacodeSelect={id => {
            contextOnMetacodeSelect(contextNode && contextNode.id, id)
          }}
          metacodeSets={metacodeSets} />
      </div>
      <div className='expandLi' />
    </li>
  }

  siblings = () => {
    const { contextPopulateSiblings, contextFetchSiblings,
            contextSiblingsData, contextFetchingSiblingsData,
            topicId, contextNode } = this.props
    const populateSiblings = () => {
      if (!this.state.populateSiblingsSent) {
        contextPopulateSiblings(contextNode.id)
        this.setState({populateSiblingsSent: true})
      }
    }
    if (!(contextNode && topicId)) {
      return null
    }
    return <li className='rc-siblings'
        onMouseOver={populateSiblings}>
      <div className='rc-icon' />
      Reveal siblings
      <ul id='fetchSiblingList'>
        <li className='fetchAll'
          onClick={() => contextFetchSiblings(contextNode)}>
          All
          <div className='rc-keyboard'>Alt+R</div>
        </li>
        {contextSiblingsData && Object.keys(contextSiblingsData).map(key => {
          return <li key={key}
            onClick={() => contextFetchSiblings(contextNode, key)}>
            {contextSiblingsData[key]}
          </li>
        })}
        {contextFetchingSiblingsData && <li id='loadingSiblings'>loading...</li>}
      </ul>
      <div className='expandLi' />
    </li>
  }

  render() {
    const { contextNode, currentUser, topicId } = this.props
    const positionData = this.getPositionData()
    const style = Object.assign({}, {position: 'absolute'}, positionData.pos)
    const showSpacer = currentUser || (contextNode && topicId)

    return <div style={style}
      className={'rightclickmenu ' + positionData.extraClasses.join(' ')}>
      <ul>
        {this.hide()}
        {this.remove()}
        {this.delete()}
        {this.center()}
        {this.popout()}
        {showSpacer && <li className='rc-spacer' />}
        {this.permission()}
        {this.metacode()}
        {this.siblings()}
      </ul>
    </div>
  }
}

export default ContextMenu

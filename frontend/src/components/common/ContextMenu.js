import React, { Component, PropTypes } from 'react'

class ContextMenu extends Component {
  static propTypes = {
    node: PropTypes.object,
    edge: PropTypes.object
  }

  render () {
    const style = {
      position: 'absolute',
      top: '10px',
      left: '10px'
    }
    return <div className="rightclickmenu" style={style}>
      <ul>
        <li className="rc-hide">
          <div className="rc-icon"></div>Hide until refresh<div className="rc-keyboard">Ctrl+H</div>
        </li>
        <li className="rc-remove ">
          <div className="rc-icon"></div>Remove from map<div className="rc-keyboard">Ctrl+M</div>
        </li>
        <li className="rc-delete ">
          <div className="rc-icon"></div>Delete<div className="rc-keyboard">Ctrl+D</div>
        </li>
        <li className="rc-popout">
          <div className="rc-icon"></div>Open in new tab
        </li>
        <li className="rc-spacer"></li>
        <li className="rc-permission">
          <div className="rc-icon"></div>Change permissions
          <ul>
            <li className="changeP toCommons"><div className="rc-perm-icon"></div>commons</li>
            <li className="changeP toPublic"><div className="rc-perm-icon"></div>public</li>
            <li className="changeP toPrivate"><div className="rc-perm-icon"></div>private</li>
          </ul>
          <div className="expandLi"></div>
        </li>
        <li className="rc-metacode">
        </li>
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

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import onClickOutsideAddon from 'react-onclickoutside'

class Permission extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectingPermission: false
    }
  }

  togglePermissionSelect = () => {
    this.setState({selectingPermission: !this.state.selectingPermission})
  }

  openPermissionSelect = () => {
    this.setState({selectingPermission: true})
  }

  closePermissionSelect = () => {
    this.setState({selectingPermission: false})
  }

  handleClickOutside = instance => {
    this.closePermissionSelect()
  }

  liClick = value => event => {
    this.closePermissionSelect()
    this.props.updateTopic({
      permission: value,
      defer_to_map_id: null
    })
    // prevents it from also firing the event listener on the parent
    event.preventDefault()
  }

  render = () => {
    const { permission, authorizedToEdit } = this.props
    const { selectingPermission } = this.state

    let classes = `linkItem mapPerm ${permission.substring(0, 2)}`
    if (selectingPermission) classes += ' minimize'

    return (
      <div className={classes}
        title={permission}
        onClick={authorizedToEdit ? this.togglePermissionSelect : null}
      >
        <ul className="permissionSelect"
          style={{ display: selectingPermission ? 'block' : 'none' }}
        >
          {permission !== 'commons' && <li className='commons' onClick={this.liClick('commons')}></li>}
          {permission !== 'public' && <li className='public' onClick={this.liClick('public')}></li>}
          {permission !== 'private' && <li className='private' onClick={this.liClick('private')}></li>}
        </ul>
      </div>
    )
  }
}

Permission.propTypes = {
  permission: PropTypes.string, // 'co', 'pu', or 'pr'
  authorizedToEdit: PropTypes.bool,
  updateTopic: PropTypes.func
}

export default onClickOutsideAddon(Permission)

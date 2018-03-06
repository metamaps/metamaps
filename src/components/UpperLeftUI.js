import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

class UpperLeftUI extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    map: PropTypes.object,
    userRequested: PropTypes.bool,
    requestAnswered: PropTypes.bool,
    requestApproved: PropTypes.bool,
    onRequestClick: PropTypes.func
  }

  render () {
    const { map, currentUser, userRequested, requestAnswered, requestApproved, onRequestClick } = this.props
    return <div className="upperLeftUI">
      <div className="homeButton">
        <Link to="/">METAMAPS</Link>
      </div>
      <div className="sidebarSearch">
        <input type="text" className="sidebarSearchField" placeholder="Search for topics, maps, and mappers..." />
        <div id="searchLoading"></div>
        <div className="sidebarSearchIcon"></div>
        <div className="clearfloat"></div>
      </div>
      {map && !map.authorizeToEdit(currentUser) && <div className="viewOnly">
        <div className="eyeball">View Only</div>
        {currentUser && !userRequested && <div className="requestAccess requestNotice" onClick={onRequestClick}>Request Access</div>}
        {userRequested && !requestAnswered && <div className="requestPending requestNotice">Request Pending</div>}
        {userRequested && requestAnswered && !requestApproved && <div className="requestNotAccepted requestNotice">Request Not Accepted</div>}
      </div>}
      <div className="clearfloat"></div>
    </div>
  }
}

export default UpperLeftUI

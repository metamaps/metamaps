import React, { Component } from 'react'

class NavBar extends Component {
  render() {
    return (
      <div id="navBar">
        <div className="navBarContainer">
          <div className="navBarMenu">
            <div className="navBarCenter">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default NavBar

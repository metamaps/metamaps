import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import _ from 'lodash'

const PROP_LIST = [
  'matchChildRoutes',
  'show',
  'text',
  'href',
  'linkClass'
]

class NavBarLink extends Component {
  static propTypes = {
    matchChildRoutes: PropTypes.bool,
    show: PropTypes.bool,
    text: PropTypes.string,
    href: PropTypes.string,
    linkClass: PropTypes.string
  }

  static contextTypes = {
    location: PropTypes.object
  }

  render = () => {
    const {
      matchChildRoutes,
      show,
      text,
      href,
      linkClass
    } = this.props
    const { location } = this.context
    const otherProps = _.omit(this.props, PROP_LIST)
    const classes = ['navBarButton', linkClass]
    const active = matchChildRoutes ?
      location.pathname.startsWith(href) :
      location.pathname === href
    if (active) classes.push('active')
    if (!show) {
      return null
    }
    return (
      <Link { ...otherProps } to={href} className={classes.join(' ')}>
        {linkClass && <div className="navBarIcon"></div>}
        <div className="navBarLinkText">{text}</div>
      </Link>
    )
  }
}

export default NavBarLink

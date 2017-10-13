import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import _ from 'lodash'

const NavBarLink = props => {
  const { show, text, href, linkClass } = props
  const otherProps = _.omit(props, ['show', 'text', 'href', 'linkClass'])
  if (!show) {
    return null
  }

  return (
    <Link { ...otherProps } to={href} className={'navBarButton ' + linkClass}>
      <div className="navBarIcon"></div>
      {text}
    </Link>
  )
}

NavBarLink.propTypes = {
  show: PropTypes.bool,
  text: PropTypes.string,
  href: PropTypes.string,
  linkClass: PropTypes.string
}

export default NavBarLink

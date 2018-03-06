import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import onClickOutsideAddon from 'react-onclickoutside'

class LoginForm extends Component {
  static propTypes = {
    loginFormAuthToken: PropTypes.string,
    closeBox: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = { token: '' }
  }

  emailInputDidMount(node) {
    node && node.focus()
  }

  handleClickOutside = () => {
    this.props.closeBox()
  }

  render () {
    return <form className="loginAnywhere" id="new_user" action="/login" acceptCharset="UTF-8" method="post">
      <input name="utf8" type="hidden" value="✓" />
      <div className="accountImage"></div>
      <div className="accountInput accountEmail">
        <input placeholder="Email" type="email" name="user[email]" id="user_email" ref={this.emailInputDidMount}/>
      </div>
      <div className="accountInput accountPassword">
        <input placeholder="Password" type="password" name="user[password]" id="user_password" />
      </div>
      <div className="accountSubmit">
        <input type="submit" name="commit" value="SIGN IN" />
      </div>
      <div className="accountRememberMe">
        <label htmlFor="user_remember_me">Stay signed in</label>
        <input name="user[remember_me]" type="hidden" value="0" />
        <input type="checkbox" value="1" name="user[remember_me]" id="user_remember_me" />
        <div className="clearfloat"></div>
      </div>
      <div className="clearfloat"></div>
      <div className="accountForgotPass">
          <Link to="/users/password/new">Forgot password?</Link>
      </div>
    </form>
  }
}

export default onClickOutsideAddon(LoginForm)

import React, { Component } from 'react'

class Login extends Component {
    render = () => {
        return (
            <div id="yield">
                <form className="centerGreyForm login" id="new_user" action="/login" acceptCharset="UTF-8" method="post">
                    <input name="utf8" type="hidden" value="✓" />
                    <input type="hidden" name="authenticity_token" value="lUpsAx9IJuu8tbp6FEWtzgj5iE/juyOGXP3O3m3tqdzspN+d5tEFDND0IZKrV8JQOQwqyNq/hq+a0tVm0BfzrQ==" />
                    <h3>SIGN IN</h3>

                    <div className="accountImage"></div>
                    <div>
                        <input autoFocus="autofocus" placeholder="Email" type="email" name="user[email]" id="user_email" /></div>

                    <div>
                        <input placeholder="Password" type="password" name="user[password]" id="user_password" /></div>

                    <div className="accountSubmit">
                        <input type="submit" name="commit" value="Sign in" data-disable-with="Sign in" />
                    </div>

                    <div className="accountRememberMe">
                        <label htmlFor="user_remember_me">Stay signed in</label>
                        <input name="user[remember_me]" type="hidden" value="0" />
                        <input type="checkbox" value="1" name="user[remember_me]" id="user_remember_me" />
                        <div className="clearfloat"></div>
                    </div>
                    <div className="clearfloat"></div>
                    <div className="accountForgotPass">
                        <a href="/users/password/new">Forgot password?</a>
                    </div>
                </form>
            </div>
        )
    }
}
export default Login
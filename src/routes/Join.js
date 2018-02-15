import React, { Component } from 'react'

class Join extends Component {
    render = () => {
        return (
            <div id="yield">
                <form className="new_user centerGreyForm" id="new_user" action="/users" acceptCharset="UTF-8" method="post">
                    <input name="utf8" type="hidden" value="✓" />
                    <input type="hidden" name="authenticity_token" value="2tn+UQ0ovmjyJOBObmSLGbN6vrRH+SOqT8s4GPtWIA2jN03P9LGdj55le6bRduSHgo8cM379hoOJ5COgRqx6fA==" />

                    <h3>Sign Up</h3>

                    <div>
                        <label className="firstFieldText" htmlFor="user_name">Name:</label>
                        <input autoFocus="autofocus" type="text" name="user[name]" id="user_name" />
                    </div>

                    <div>
                        <label className="fieldText" htmlFor="user_email">Email:</label>
                        <input type="email" name="user[email]" id="user_email" />
                    </div>

                    <div>
                        <label className="fieldText" htmlFor="user_password">Password:</label>
                        <input type="password" name="user[password]" id="user_password" />
                    </div>

                    <div>
                        <label className="fieldText" htmlFor="user_password_confirmation">Password Confirmation:</label>
                        <input type="password" name="user[password_confirmation]" id="user_password_confirmation" />
                    </div>

                    <div>
                        <label className="fieldText" htmlFor="user_Access Code:">Access code:</label>
                        <input type="text" name="user[joinedwithcode]" id="user_joinedwithcode" />
                    </div>

                    <div>
                        <input type="submit" name="commit" value="Sign up!" data-disable-with="Sign up!" />
                    </div>

                    <div className="smallText">
                        <br />Don't have an access code?<br /><a href="/request">Request an Invite</a>
                    </div>
                </form>
            </div>
        )
    }
}

export default Join
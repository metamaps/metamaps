import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
{ form_for(resource, :as => resource_name, :url => password_path(resource_name), :html => { :method => :put, :className => "forgotPassword centerGreyForm forgotPasswordReset" }) do |f| }
  { f.hidden_field :reset_password_token }
  
  <h3>Change password</h3>

  <div>{ f.label :password, "New password", :className => "firstFieldText" }
  { f.password_field :password, :autofocus => true }</div>

  <div>{ f.label :password_confirmation, "Confirm new password", :className => "firstFieldText" }
  { f.password_field :password_confirmation }</div>

  <div>{ f.submit "Change my password" }</div>
  
{ end }
</div>
    )
  }
}

export default MyComponent


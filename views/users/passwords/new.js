import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
{ form_for(resource, :as => resource_name, :url => password_path(resource_name), :html => { :method => :post, :className => "forgotPassword centerGreyForm" }) do |f| }
  
  <h3>FORGOT PASSWORD?</h3>

  <div>{ f.label :email, "Enter your email:", :className => "firstFieldText" }
  { f.email_field :email, :autofocus => true }</div>

  <div>{ f.submit "Send Password Reset Instructions" }</div>
  
{ end }
</div>
    )
  }
}

export default MyComponent



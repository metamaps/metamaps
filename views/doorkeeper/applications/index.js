import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
<div className="centerContent">
<div className="page-header">
  <h2>{ t('.title') }</h2>
</div>

<table className="table table-striped">
  <thead>
  <tr>
    <th>{ t('.name') }</th>
    <th>{ t('.callback_url') }</th>
    <th></th>
  </tr>
  </thead>
  <tbody>
  { @applications.each do |application| }
    <tr id="application_{ application.id }">
      <td>{ link_to application.name, oauth_application_path(application) }</td>
      <td>{ application.redirect_uri }</td>
      <td>{ render 'delete_form', application: application }</td>
    </tr>
  { end }
  </tbody>
</table>
{ link_to t('.new'), new_oauth_application_path, className: 'button link-button' }
</div>
</div>
    )
  }
}

export default MyComponent

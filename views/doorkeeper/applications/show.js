import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
<div className="centerContent showApp">

  { link_to t('doorkeeper.applications.buttons.back'), oauth_applications_path(), className: 'button link-button button-margin' }

  <div className="page-header">
    <h2>{ t('.title', name: @application.name) }</h2>
  </div>

    <h4>{ t('.application_id') }:</h4>
    <p><code id="application_id">{ @application.uid }</code></p>

    <h4>{ t('.secret') }:</h4>
    <p><code id="secret">{ @application.secret }</code></p>


    <h4>{ t('.callback_urls') }:</h4>

    <table>
      { @application.redirect_uri.split.each do |uri| }
        <tr>
          <td>
            <code>{ uri }</code>
          </td>
          <td>
            { link_to t('doorkeeper.applications.buttons.authorize'), oauth_authorization_path(client_id: @application.uid, redirect_uri: uri, response_type: 'code'), className: 'button link-button', target: '_blank' }
          </td>
        </tr>
      { end }
    </table>

    <div className="inline-button">{ link_to t('doorkeeper.applications.buttons.edit'), edit_oauth_application_path(@application), className: 'button link-button' }</div>

    <div className="inline-button">{ render 'delete_form', application: @application, submit_btn_css: 'button red-button' }</div>
</div>
</div>
    )
  }
}

export default MyComponent

import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
  <div className="centerContent">
    <header className="page-header" role="banner">
      <h1>{ t('.title') }</h1>
    </header>

    <main role="main">
      <p className="h4">
        { raw t('.prompt', client_name: "<strong className=\"text-info\">#{ @pre_auth.client.name }</strong>") }
      </p>

      { if @pre_auth.scopes.count > 0 }
        <div id="oauth-permissions">
          <p>{ t('.able_to') }:</p>

          <ul className="text-info">
            { @pre_auth.scopes.each do |scope| }
              <li>{ t scope, scope: [:doorkeeper, :scopes] }</li>
            { end }
          </ul>
        </div>
      { end }

      <div className="actions">
        <div className="inline-button button-margin-top">
          { form_tag oauth_authorization_path, method: :post do }
            { hidden_field_tag :client_id, @pre_auth.client.uid }
            { hidden_field_tag :redirect_uri, @pre_auth.redirect_uri }
            { hidden_field_tag :state, @pre_auth.state }
            { hidden_field_tag :response_type, @pre_auth.response_type }
            { hidden_field_tag :scope, @pre_auth.scope }
            { submit_tag t('doorkeeper.authorizations.buttons.authorize'), className: "button" }
          { end }
        </div>
        <div className="inline-button button-margin-top">
          { form_tag oauth_authorization_path, method: :delete do }
            { hidden_field_tag :client_id, @pre_auth.client.uid }
            { hidden_field_tag :redirect_uri, @pre_auth.redirect_uri }
            { hidden_field_tag :state, @pre_auth.state }
            { hidden_field_tag :response_type, @pre_auth.response_type }
            { hidden_field_tag :scope, @pre_auth.scope }
            { submit_tag t('doorkeeper.authorizations.buttons.deny'), className: "button red-button" }
          { end }
        </div>
      </div>
    </main>
  </div>
</div>
    )
  }
}

export default MyComponent

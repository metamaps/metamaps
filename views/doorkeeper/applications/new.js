import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
<div className="centerContent">
{ link_to t('doorkeeper.applications.buttons.back'), oauth_applications_path(), className: 'button link-button button-margin' }
<div className="page-header">
  <h2>{ t('.title') }</h2>
</div>

{ render 'form', application: @application }
</div>
</div>
    )
  }
}

export default MyComponent

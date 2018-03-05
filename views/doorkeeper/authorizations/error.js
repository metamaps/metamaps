import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
  <div className="centerContent">
    <div className="page-header">
      <h2>{ t('doorkeeper.authorizations.error.title') }</h2>
    </div>

    <main role="main">
      <div>{ @pre_auth.error_response.body[:error_description] }</div>
    </main>
  </div>
</div>
    )
  }
}

export default MyComponent

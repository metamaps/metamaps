import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
  <div className="centerContent">
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

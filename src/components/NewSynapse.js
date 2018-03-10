import React, { Component } from 'react'

class NewSynapse extends Component {
  componentDidMount() {
    this.props.initNewSynapse()
  }

  render = () => {
    return (
      <form className="new_synapse" id="new_synapse" action="/synapses" acceptCharset="UTF-8" data-remote="true" method="post">
        <input name="utf8" type="hidden" value="✓" />
        <input placeholder="describe the connection..." type="text" name="synapse[desc]" id="synapse_desc" className="tt-input" autoComplete="off" spellCheck="false" dir="auto" />
      </form>
    )
  }
}

export default NewSynapse
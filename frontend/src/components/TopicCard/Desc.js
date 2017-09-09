import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { RIETextArea } from 'riek'
import Util from '../../Metamaps/Util'

class MdTextArea extends RIETextArea {
  keyDown = (event) => {
    // we'll handle Enter on our own, thanks
    const ESC = 27
    if (event.keyCode === ESC) {
      this.cancelEditing()
    }
  }

  renderNormalComponent = () => {
    // defaultProps MUST use dangerouslySetInnerHTML
    return <span tabIndex="0"
      className={this.makeClassString()}
      onFocus={this.startEditing}
      onClick={this.startEditing}
      {...this.props.defaultProps}
    />
  }
}

class Desc extends Component {
  render = () => {
    const descHTML = (!this.props.desc && this.props.authorizedToEdit)
      ? '<p>Click to add description...</p>'
      : Util.mdToHTML(this.props.desc)

    if (this.props.authorizedToEdit) {
      return (
      <div className="scroll">
        <div className="desc">
          <MdTextArea value={this.props.desc}
            propName="desc"
            change={this.props.onChange}
            className="riek_desc"
            classEditing="riek-editing"
            editProps={{
              onKeyPress: e => {
                const ENTER = 13
                if (!e.shiftKey && e.which === ENTER) {
                  e.preventDefault()
                  this.props.onChange({ desc: e.target.value })
                }
              }
            }}
            defaultProps={{
              dangerouslySetInnerHTML: { __html: descHTML }
            }}
          />
          <div className="clearfloat"></div>
        </div>
      </div>
      )
    } else {
      return (
        <div className="scroll">
          <div className="desc">
            <span className="riek_desc">
              {this.props.desc}
            </span>
          </div>
        </div>
      )
    }
  }
}

Desc.propTypes = {
  desc: PropTypes.string, // markdown
  authorizedToEdit: PropTypes.bool,
  onChange: PropTypes.func
}

export default Desc

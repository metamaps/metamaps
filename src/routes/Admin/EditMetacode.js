import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import AdminHeader from './AdminHeader'

class EditMetacode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      existingIcon: null,
      icon: null,
      name: '',
      color: ''
    }
  }

  componentDidMount() {
    const { metacodes } = this.props
    const id = parseInt(this.props.params.id, 10)
    const metacode = metacodes.find(m => m.id === id)
    this.setState({
      existingIcon: metacode.icon,
      name: metacode.name,
      color: metacode.color
    })
  }

  validate = (event) => {
    if (this.state.name.length === 0) {
      event.preventDefault()
      window.alert('A name must be provided')
    } else if (!this.state.color.startsWith('#')) {
      event.preventDefault()
      window.alert('Please begin color with a # symbol')
    }
  }

  updateForKey = (key) => event => this.setState({[key]: event.target.value})

  handleFile = (event) => {
    this.setState({
      icon: event.target.files[0]
    })
  }

  onSubmit = async (event) => {
    event.preventDefault()
    const { name, color, icon } = this.state
    const { updateMetacode, params: { id } } = this.props
    try {
      const result = await updateMetacode(id, name, color, icon)
      browserHistory.push(`/metacodes`)
    } catch (e) {
      console.log(e)
      window.alert('There was an error updating the metacode, check the console')
    }
  }

  render = () => {
    return (
      <div>
        <div id="yield">
          <div className="centerContent">
            <form onSubmit={this.onSubmit} className="edit_metacode" id="edit_metacode" encType="multipart/form-data" acceptCharset="UTF-8">
              <input name="utf8" type="hidden" value="✓" />
              <div className="field">
                <label htmlFor="metacode_name">Name</label>
                <input value={this.state.name} onChange={this.updateForKey('name')} type="text" name="metacode[name]" id="metacode_name" />
                <div className="clearfloat"></div>
              </div>
              <div className="field">
                <label>Current Icon</label>
                <img width="96" src={this.state.existingIcon} alt={this.state.name} />
              </div>
              <div className="field">
                <label htmlFor="metacode_Icon">Replace Icon</label>
                <input type="hidden" name="metacode[manual_icon]" id="metacode_manual_icon" />
                <input onChange={this.handleFile} type="file" name="metacode[aws_icon]" id="metacode_aws_icon" />
                <div className="clearfloat"></div>
              </div>
              <div className="field">
                <label htmlFor="metacode_color">Color (hex with # sign)</label>
                <input value={this.state.color} onChange={this.updateForKey('color')} type="text" name="metacode[color]" id="metacode_color" />
                <div className="clearfloat"></div>
              </div>
              <div className="actions">
                <Link className="button" to="/metacodes">Cancel</Link>
                <input onClick={this.validate} type="submit" name="commit" value="Update Metacode" className="add" />
              </div>
            </form>
          </div>
        </div>
        <AdminHeader />
      </div>
    )
  }
}

export default EditMetacode
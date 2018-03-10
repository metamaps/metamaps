import React, { Component } from 'react'
import { Link } from 'react-router'

class MetacodeSetEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectMetacodes: [],
      name: '',
      desc: ''
    }
  }

  componentDidMount() {
    const { forEdit, metacodeSet } = this.props
    if (forEdit) {
      this.setState({
        selectMetacodes: metacodeSet.metacodes,
        name: metacodeSet.name,
        desc: metacodeSet.desc
      })
    }
  }

  selectAll = () => {
    this.setState({
      selectMetacodes: this.props.metacodes.map(m => m.id)
    })
  }

  deselectAll = () => {
    this.setState({ selectMetacodes: [] })
  }

  liClickHandler = (metacodeId) => {
    const { selectMetacodes } = this.state
    if (selectMetacodes.indexOf(metacodeId) > -1) {
      this.setState({
        selectMetacodes: selectMetacodes.filter(id => id !== metacodeId)
      })
    } else {
      this.setState({
        selectMetacodes: selectMetacodes.concat([metacodeId])
      })
    }
  }

  updateForKey = (key) => event => this.setState({[key]: event.target.value})

  validate = (event) => {
    if (this.state.selectMetacodes.length === 0) {
      event.preventDefault()
      window.alert('Please select at least one metacode for the set')
    } else if (this.state.name.length === 0) {
      event.preventDefault()
      window.alert('A name must be provided')
    }
  }

  onSubmit = (event) => {
    event.preventDefault()
    const { selectMetacodes, name, desc } = this.state
    this.props.onSubmit(selectMetacodes, name, desc)
  }

  render = () => {
    const { selectMetacodes } = this.state
    const { metacodes, forNew, forEdit } = this.props
    const { length } = metacodes
    return (
      <form className={forNew ? "new_metacode_set" : "edit_metacode_set"} id={forNew ? "new_metacode_set" : "edit_metacode_set"} onSubmit={this.onSubmit} acceptCharset="UTF-8">
        <input name="utf8" type="hidden" value="✓" />
        <div className="field">
          <label htmlFor="metacode_set_name">Name</label>
          <input value={this.state.name} onChange={this.updateForKey('name')} type="text" name="metacode_set[name]" id="metacode_set_name" />
          <div className="clearfloat"></div>
        </div>
        <div className="field">
          <label htmlFor="metacode_set_desc">Description</label>
          <textarea value={this.state.desc} onChange={this.updateForKey('desc')} cols="40" rows="4" name="metacode_set[desc]" id="metacode_set_desc" />
          <div className="clearfloat"></div>
        </div>
        <br />
        <p>Choose Metacodes</p>
        <div className="allMetacodes">
          <span id="showAll" onClick={this.selectAll}>Select All</span>
          <span id="hideAll" onClick={this.deselectAll}>Unselect All</span>
        </div>
        <div className="clearfloat"></div>
        <div className="editMetacodes">
          <ul id="filters-one">
            {metacodes.filter((m, i) => i < length/4).map((m, i) => {
              return <MetacodeListItem selected={selectMetacodes.indexOf(m.id) > -1} metacode={m} key={i} onClick={() => this.liClickHandler(m.id)} />
            })}
          </ul>
          <ul id="filters-two">
            {metacodes.filter((m, i) => i >= length/4 && i < length/4*2).map((m, i) => {
              return <MetacodeListItem selected={selectMetacodes.indexOf(m.id) > -1} metacode={m} key={i} onClick={() => this.liClickHandler(m.id)} />
            })}
          </ul>
          <ul id="filters-three">
            {metacodes.filter((m, i) => i >= length/4*2 && i < length/4*3).map((m, i) => {
              return <MetacodeListItem selected={selectMetacodes.indexOf(m.id) > -1} metacode={m} key={i} onClick={() => this.liClickHandler(m.id)} />
            })}
          </ul>
          <ul id="filters-four">
            {metacodes.filter((m, i) => i >= length/4*3 && i < length).map((m, i) => {
              return <MetacodeListItem selected={selectMetacodes.indexOf(m.id) > -1} metacode={m} key={i} onClick={() => this.liClickHandler(m.id)} />
            })}
          </ul>
        </div>
        <div className="clearfloat"></div>
        <div className="actions">
          <Link className="button" to="/metacode_sets">Cancel</Link>
          <input onClick={this.validate} type="submit" name="commit" value={forNew ? "Create Metacode Set" : "Update Metacode Set"} className="add" />
        </div>
      </form>
    )
  }
}

class MetacodeListItem extends Component {
  render = () => {
    const { selected, onClick, metacode } = this.props
    return (
      <li id={metacode.id} className={selected ? "" : "toggledOff"} onClick={onClick}>
        <img src={metacode.icon} alt={metacode.name} />
        <p>{metacode.name.toLowerCase()}</p>
        <div className="clearfloat"></div>
      </li>
    )
  }
}

export default MetacodeSetEditor
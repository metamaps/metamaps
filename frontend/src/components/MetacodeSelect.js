/* global $ */

import React, { Component, PropTypes } from 'react'

const ENTER_KEY = 13
const LEFT_ARROW = 37
const UP_ARROW = 38
const RIGHT_ARROW = 39
const DOWN_ARROW = 40

const Metacode = (props) => {
  const { m, onClick, underCursor } = props
  
  return (
    <li onClick={() => onClick(m.id) } className={ underCursor ? 'keySelect' : '' }>
      <img src={ m.get('icon') } />
      <span>{ m.get('name') }</span>
    </li>
  )
}

class MetacodeSelect extends Component {
  
  constructor (props) {
    super(props)
    this.state = {
      filterText: '',
      selectingSection: true,
      underCursor: 0
    }
  }
  
  componentDidMount() {
    const self = this
    setTimeout(function() {
      $(document.body).on('keyup.metacodeSelect', self.handleKeyUp.bind(self))
    }, 10)
  }
  
  componentWillUnmount() {
    $(document.body).off('.metacodeSelect')
  }
  
  changeFilterText (e) {
    this.setState({ filterText: e.target.value, underCursor: 0 })
  }
  
  getSelectMetacodes () {
    const { metacodes, recent, mostUsed } = this.props
    const { filterText, activeTab } = this.state

    let selectMetacodes = metacodes
    if (filterText.length > 1) { // search
      selectMetacodes = filterText.length > 1 ? metacodes.filter(m => {
        return m.get('name').toLowerCase().search(filterText.toLowerCase()) > -1
      }) : []
    }
    return selectMetacodes
  }
  
  handleKeyUp (e) {
    const { close } = this.props
    const { underCursor } = this.state
    const selectMetacodes = this.getSelectMetacodes()
    let nextIndex

    switch (e.which) {
      case ENTER_KEY:
        if (selectMetacodes.length) this.resetAndClick(selectMetacodes[underCursor].id)
        break
      case UP_ARROW:
        if (underCursor == 0) {
          close()
          break
        }
        nextIndex = underCursor == 0 ? selectMetacodes.length - 1 : underCursor - 1
        this.setState({ underCursor: nextIndex })
        break
      case DOWN_ARROW:
        nextIndex = underCursor == selectMetacodes.length - 1 ? 0 : underCursor + 1
        this.setState({ underCursor: nextIndex })
        break
    }
  }
  
  resetAndClick (id) {
    const { onClick } = this.props
    this.setState({ filterText: '', underCursor: 0 })
    onClick(id)
  }
  
  render () {
    const { onClick, close } = this.props
    const { filterText, underCursor } = this.state
    const selectMetacodes = this.getSelectMetacodes()
    return <div className='metacodeSelect'>
      <div className='tabList'>
        <input type='text'
                 className='metacodeFilterInput'
                 placeholder='Search...'
                 ref='input'
                 value={ filterText }
                 onChange={ this.changeFilterText.bind(this) } />
        <ul className='metacodeList'>
          { selectMetacodes.map((m, index) => {
            return <Metacode underCursor={underCursor == index} 
                             key={m.id} 
                             m={m} 
                             onClick={this.resetAndClick.bind(this)} />
          })}
        </ul>
        <div className='clearfloat'></div>
      </div>
    </div>
  }
}

MetacodeSelect.propTypes = {
  onClick: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  metacodes: PropTypes.array.isRequired,
}

export default MetacodeSelect


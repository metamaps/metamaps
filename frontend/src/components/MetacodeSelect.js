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
      activeTab: 0,
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
  
  changeDisplay (activeTab) {
    this.setState({ activeTab, underCursor: 0 })
  }
  
  getSelectMetacodes () {
    const { metacodes, recent, mostUsed } = this.props
    const { filterText, activeTab } = this.state

    let selectMetacodes = []
    if (activeTab == 0) { // search
      selectMetacodes = filterText.length > 1 ? metacodes.filter(m => {
        return m.get('name').toLowerCase().search(filterText.toLowerCase()) > -1
      }) : []
    } else if (activeTab == 1) { // recent
      selectMetacodes = recent.map(id => {
        return metacodes.find(m => m.id == id)
      }).filter(m => m)
    } else if (activeTab == 2) { // mostUsed
      selectMetacodes = mostUsed.map(id => {
        return metacodes.find(m => m.id == id)
      }).filter(m => m)
    }
    return selectMetacodes
  }
  
  handleKeyUp (e) {
    const { close } = this.props
    const { activeTab, underCursor, selectingSection } = this.state
    const selectMetacodes = this.getSelectMetacodes()
    let nextIndex

    switch (e.which) {
      case ENTER_KEY:
        if (selectMetacodes.length && !selectingSection) this.resetAndClick(selectMetacodes[underCursor].id)
        break
      case UP_ARROW:
        if (selectingSection && activeTab == 0) {
          close()
          break
        }
        else if (selectingSection) {
          nextIndex = activeTab - 1
          this.changeDisplay(nextIndex)
          break
        }
        nextIndex = underCursor == 0 ? selectMetacodes.length - 1 : underCursor - 1
        this.setState({ underCursor: nextIndex })
        break
      case DOWN_ARROW:
        if (selectingSection) {
          nextIndex = activeTab == 2 ? 0 : activeTab + 1
          this.changeDisplay(nextIndex)
          break
        }
        nextIndex = underCursor == selectMetacodes.length - 1 ? 0 : underCursor + 1
        this.setState({ underCursor: nextIndex })
        break
      case RIGHT_ARROW:
        if (selectingSection) this.setState({ selectingSection: false })
        break
      case LEFT_ARROW:
        if (!selectingSection) this.setState({ selectingSection: true })
        break
    }
  }
  
  resetAndClick (id) {
    const { onClick } = this.props
    this.setState({ filterText: '', underCursor: 0 })
    this.changeDisplay(0)
    onClick(id)
  }
  
  render () {
    const { onClick, close, recent, mostUsed } = this.props
    const { filterText, activeTab, underCursor, selectingSection } = this.state
    const selectMetacodes = this.getSelectMetacodes()
    return <div className='metacodeSelect'>
      <div className='tabList'>
        <div className={ activeTab == 0 ? 'active' : '' }
             onClick={() => { this.changeDisplay(0) }}>
          <input type='text'
                 className='metacodeFilterInput'
                 placeholder='Search...'
                 ref='input'
                 value={ filterText }
                 onChange={ this.changeFilterText.bind(this) } />
        </div>
        <div className={ activeTab == 1 ? 'active' : '' }
             onClick={() => { this.changeDisplay(1) }}>
          <span>Recent</span>
        </div>
        <div className={ activeTab == 2 ? 'active' : '' }
             onClick={() => { this.changeDisplay(2) }}>
          <span>Most Used</span>
        </div>
      </div>
      <ul className='metacodeList'>
        { selectMetacodes.map((m, index) => {
            return <Metacode underCursor={!selectingSection && underCursor == index} 
                             key={m.id} 
                             m={m} 
                             onClick={this.resetAndClick.bind(this)} />
          })}
      </ul>
      <div className='clearfloat'></div>
    </div>
  }
}

MetacodeSelect.propTypes = {
  onClick: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  metacodes: PropTypes.array.isRequired,
  recent: PropTypes.array.isRequired,
  mostUsed: PropTypes.array.isRequired
}

export default MetacodeSelect


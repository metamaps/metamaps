import React, { Component } from 'react'
import { browserHistory } from 'react-router'

import AdminHeader from './AdminHeader'
import MetacodeSetEditor from './MetacodeSetEditor'

/*
TODO: 
  get the data actually updating after the network response
*/

class EditMetacodeSet extends Component {
  onSubmit = async (metacodes, name, desc) => {
    const { updateMetacodeSet, params: { id } } = this.props
    try {
      const result = await updateMetacodeSet(id, metacodes, name, desc)
      browserHistory.push(`/metacode_sets`)
    } catch (e) {
      console.log(e)
      window.alert('There was an error updating the metacode set')
    }
  }

  render = () => {
    const { metacodeSets, metacodes } = this.props
    const id = parseInt(this.props.params.id, 10)
    const metacodeSet = metacodeSets.find(m => m.id === id)
    return (
      <div>
        <div id="yield">
          <div className="centerContent">
            <MetacodeSetEditor metacodeSet={metacodeSet} metacodes={metacodes} onSubmit={this.onSubmit} forEdit />
          </div>
        </div>
        <AdminHeader />
      </div>
    )
  }
}

export default EditMetacodeSet
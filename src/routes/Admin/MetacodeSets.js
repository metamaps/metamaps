import React, { Component } from 'react'
import { Link } from 'react-router'
import AdminHeader from './AdminHeader'

/*
TODO: 
  make the delete metacode set button work
*/

class MetacodeSets extends Component {
  render = () => {
    const { metacodeSets, metacodes } = this.props
    return (
      <div>
        <div id="yield">
          <div className="centerContent">
            <br />
            <table>
              <tbody>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Metacodes</th>
                </tr>
                {metacodeSets.filter(m => m.id).map((metacodeSet, i) => {
                  return <MetacodeSetRow key={i} metacodeSet={metacodeSet} metacodes={metacodes} />
                })}
              </tbody>
            </table>
          </div>
        </div>
        <AdminHeader />
      </div>
    )
  }
}

class MetacodeSetRow extends Component {
  render = () => {
    const { metacodeSet, metacodes } = this.props
    return (
      <tr>
        <td>
          {metacodeSet.name}
          <br />
          <Link to={`/metacode_sets/${metacodeSet.id}/edit`}>Edit</Link>
          <br />
          <a data-confirm="Are you sure?" rel="nofollow" data-method="delete" href={`/metacode_sets/${metacodeSet.id}`}>Delete</a>
        </td>
        <td className="metacodeSetDesc">
          {metacodeSet.desc}
        </td>
        <td>
          {metacodeSet.metacodes.map((mId, index) => {
            const metacode = metacodes.find(m => m.id === mId)
            return (
              <span key={index}>
                <img className="metacodeSetImage" src={metacode.icon} />
                {(index+1) % 4 === 0 && <div className='clearfloat'></div>}
              </span>
            )
          })}
          <div className='clearfloat'></div>
        </td>
      </tr>
    )
  }
}

export default MetacodeSets
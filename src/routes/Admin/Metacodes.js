import React, { Component } from 'react'
import { Link } from 'react-router'
import AdminHeader from './AdminHeader'

class Metacodes extends Component {
  render = () => {
    return (
      <div>
        <div id="yield">
          <div className="centerContent">
            <br />
            <table>
              <tbody>
                <tr>
                  <th>Name</th>
                  <th>Icon</th>
                  <th>Color</th>
                  <th></th>
                  <th></th>
                </tr>
                {this.props.metacodes.map(metacode => {
                  return (
                    <tr key={metacode.id}>
                      <td>{metacode.name}</td>
                      <td className="iconURL">{metacode.icon}</td>
                      {metacode.color && <td className="iconColor" style={{backgroundColor: metacode.color}}>{metacode.color}</td>}
                      {!metacode.color && <td></td>}
                      <td><img width="40" src={metacode.icon} alt="metacode image" /></td>
                      <td><Link to={`/metacodes/${metacode.id}/edit`}>Edit</Link></td>
                    </tr>
                  )
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

export default Metacodes
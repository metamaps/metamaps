import React, { Component } from 'react'
import { Link } from 'react-router'

import AppsHeader from './AppsHeader'

class Apps extends Component {
  render = () => {
    return (
      <div>
        <div id="yield">
          <div className="centerContent">
            <div className="page-header">
              <h2>Registered Apps</h2>
            </div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Redirect URIs</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.props.apps.map(app => {
                  return (
                    <tr id={`application_${app.id}`}>
                      <td><Link to="/oauth/applications/1">{app.name}</Link></td>
                      <td>{app.uris}</td>
                      <td>
                        <form action={`/oauth/applications/${app.id}`} acceptCharset="UTF-8" method="post">
                          <input name="utf8" type="hidden" value="✓" />
                          <input type="hidden" name="_method" value="delete" />
                          <input type="submit" name="commit" value="remove" onclick="return confirm('Are you sure?')" className="button red-button" data-disable-with="remove" />
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <Link className="button link-button" to="/oauth/applications/new">New App</Link>
          </div>
        </div>
        <AppsHeader />
      </div>
    )
  }
}

export default Apps
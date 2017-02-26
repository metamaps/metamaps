/* global $ */

/*
 * Metacode selector component
 *
 * This component takes in a callback (onMetacodeSelect; takes one metacode id)
 * and a list of metacode sets and renders them. If you click a metacode, it
 * passes that metacode's id to the callback.
 */

import React, { PropTypes, Component } from 'react'

class MetacodeSelect extends Component {
  render = () => {
    return (
      <div id="metacodeOptions">
        <ul>
          {this.props.metacodeSets.map(set => (
            <li key={set.name}>
              <span>{set.name}</span>
              <div className="expandMetacodeSet"></div>
              <ul>
                {set.metacodes.map(m => (
                  <li key={m.id}
                    onClick={() => this.props.onMetacodeSelect(m.id)}
                  >
                    <img width="24" height="24" src={m.icon_path} alt={m.name} />
                    <div className="mSelectName">{m.name}</div>
                    <div className="clearfloat"></div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

MetacodeSelect.propTypes = {
  onMetacodeClick: PropTypes.func,
  metacodeSets: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    metacodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      icon_path: PropTypes.string, // url
      name: PropTypes.string
    }))
  }))
}

export default MetacodeSelect

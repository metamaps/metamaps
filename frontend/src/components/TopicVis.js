import React, { Component } from 'react'
import PropTypes from 'prop-types'

// There would be separate one of these for mapview and topicview

/*
it could use the diffing intelligently to know when you
update the visualization

use componentDidUpdate to check for differences in
- topic list, synapse list, mapping list, etc
- use that info to intelligently update and animate the viz.

basically port everything from VISUALIZE module over into here

it should dynamically generate and pass in callbacks to the visualization
*/

class MapVis extends Component {
  static propTypes = {
    topics: PropTypes.array,
    synapses: PropTypes.array,
    mappings: PropTypes.array,
    filters: PropTypes.array,
    selectedNodes: PropTypes.array,
    selectedEdges: PropTypes.array,
    onSelect: PropTypes.func,
    onPan: PropTypes.func,
    onZoom: PropTypes.func,
    onDrawSelectBox: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      mGraph: null
    }
  }

  componentDidMount() {
    
  }

  render () {
    return <div id="infovis" />
  }
}

export default MapVis

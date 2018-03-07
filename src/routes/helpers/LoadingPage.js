import React, { Component } from 'react'

import Loading from '../../components/Loading'

class LoadingPage extends Component {
  render = () => {
    return (
      <div id="yield">
        <div className="centerContent withPadding back">
          <Loading />
        </div>
      </div>
    )
  }
}

export default LoadingPage
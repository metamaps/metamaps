import React, { Component } from 'react'

import About from './About'
import CheatSheet from './CheatSheet'
import ForkMap from './ForkMap'
import Invite from './Invite'
import NoIE from './NoIE'
import SwitchMetacodes from './SwitchMetacodes'
import Tutorial from './Tutorial'

class LightBoxes extends Component {
  render = () => {
    return (
      <div id="lightbox_overlay">
        <div id="lightbox_main">
          <a id="lightbox_close" href="#"></a>
          <div id="lightbox_content">
            <About />
            <CheatSheet />
            <ForkMap />
            <Invite />
            <NoIE />
            <SwitchMetacodes />
            <Tutorial />
          </div>
        </div>
        <div id="lightbox_screen" style={{height: '100%'}}></div>
      </div>
    )
  }
}

export default LightBoxes
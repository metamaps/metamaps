import React, { Component } from 'react'

class About extends Component {
  render = () => {
    return (
      <div className="lightboxContent" id="about">
        <h3>About Metamaps.cc</h3>
        <div id="aboutParms">
          <div id="leftAboutParms">
            <p>STATUS: </p>
            <p>VERSION: </p>
            <p>BUILD: </p>
            <p>LAST UPDATE: </p>
          </div>
          <div id="rightAboutParms">
            <p>PRIVATE BETA</p>
            <p></p>
            <p></p>
            <p></p>
          </div>
          <div className="clearfloat"></div>
        </div>
        <p>Metamaps.cc is a free and open source web platform that supports real-time sense-making and distributed collaboration between individuals, communities and organizations.</p>
        <p>Using an intuitive graph-based interface, Metamaps.cc helps map out networks of people, ideas, resources, stories, experiences, conversations and much more. The platform is evolving for a range of applications amidst a growing network of designers, developers, facilitators, practitioners, entrepreneurs, and artists.</p>
        <p>Metamaps.cc is created and maintained by a distributed community of contributors passionate about the evolution of collaboration, alternative forms of value creation and increase of collective intelligence through the lens of the open culture and the peer-to-peer revolution.</p>
        <ul className="lightbox_links">
          <li>
            <a className="icon_twitter" href="https://twitter.com/metamapps" target="_blank">
              <div className="lightboxAboutIcon"></div>
              @metamapps
          </a>
          </li>
          <li>
            <a className="icon_community" href="https://www.hylo.com/c/metamaps/join/mice-late-hit-two-shown" target="_blank">
              <div className="lightboxAboutIcon"></div>
              community
          </a>
          </li>
          <li>
            <a className="icon_source_code" href="https://github.com/metamaps/metamaps" target="_blank">
              <div className="lightboxAboutIcon"></div>
              source code
          </a>
          </li>
          <li>
            <a className="icon_howtos" href="https://docs.metamaps.cc" target="_blank">
              <div className="lightboxAboutIcon"></div>
              howtos
          </a>
          </li>
          <li>
            <a className="icon_terms" href="https://metamaps.cc/maps/331" target="_blank">
              <div className="lightboxAboutIcon"></div>
              terms
          </a>
          </li>
        </ul>
        <div className="clearfloat"></div>
      </div>
    )
  }
}

export default About
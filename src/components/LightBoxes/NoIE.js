import React, { Component } from 'react'

class NoIE extends Component {
  render = () => {
    return (
      <div className="lightboxContent" id="noIE">
        <h3>OOPS! <br /> YOUR BROWSER IS NOT SUPPORTED.</h3>
        <p id="noIEsubheading">To view this experience, please upgrade to the latest one of these browsers:</p>
        <a id="chromeIcon" href="https://www.google.com/chrome/browser/" target="_blank">Chrome</a>
        <a id="fireFoxIcon" href="https://www.mozilla.org/en-US/firefox/new/" target="_blank">Firefox</a>
        <a id="safariIcon" href="http://support.apple.com/downloads/#safari" target="_blank">Safari</a>
        <p id="noIEbody">
          While it's downloading, explore our <a href="http://blog.metamaps.cc/">blog</a>,<br />
          watch the <a href="http://vimeo.com/88334167">tutorials</a>,
          or visit our <a href="https://docs.metamaps.cc">knowledge base</a>!
        </p>
      </div>
    )
  }
}

export default NoIE
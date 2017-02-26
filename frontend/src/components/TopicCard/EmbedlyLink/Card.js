/* global $, embedly */
import React, { PropTypes, Component } from 'react'

class EmbedlyCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      embedlyLinkStarted: false,
      embedlyLinkLoaded: false,
      embedlyLinkError: false
    }
  }

  componentDidMount = () => {
    embedly('on', 'card.rendered', this.embedlyCardRendered)
    if (this.props.link) this.loadLink()
  }

  componentWillUnmount = () => {
    embedly('off')
  }

  componentDidUpdate = () => {
    const { embedlyLinkStarted } = this.state
    !embedlyLinkStarted && this.props.link && this.loadLink()
  }

  embedlyCardRendered = (iframe, test) => {
    this.setState({embedlyLinkLoaded: true, embedlyLinkError: false})
  }

  loadLink = () => {
    this.setState({ embedlyLinkStarted: true })
    var e = embedly('card', document.getElementById('embedlyLink'))
    if (e && e.type === 'error') this.setState({embedlyLinkError: true})
  }

  render = () => {
    const { link } = this.props
    const { embedlyLinkLoaded, embedlyLinkStarted, embedlyLinkError } = this.state

    const notReady = embedlyLinkStarted && !embedlyLinkLoaded && !embedlyLinkError

    return (
      <div>
        <a style={{ display: notReady ? 'none' : 'block' }}
          href={link}
          id="embedlyLink"
          target="_blank"
          data-card-description="0"
        >
          {link}
        </a>
        {notReady && <div id="embedlyLinkLoader">loading...</div>}
      </div>
    )
  }
}

EmbedlyCard.propTypes = {
  link: PropTypes.string
}

export default EmbedlyCard

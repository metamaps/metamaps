/* global embedly */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

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
    const { embedlyLinkLoaded, embedlyLinkStarted, embedlyLinkError } = this.state

    const notReady = embedlyLinkStarted && !embedlyLinkLoaded && !embedlyLinkError

    return (
      <div className="embeds">
        <a style={{ display: notReady ? 'none' : 'block' }}
          href={this.props.link}
          id="embedlyLink"
          target="_blank"
          data-card-description="0"
        >
          {this.props.link}
        </a>
        {notReady && <div id="embedlyLinkLoader">loading...</div>}
        {this.props.authorizedToEdit && (
          <div id="linkremove" onClick={this.props.removeLink} />
        )}
      </div>
    )
  }
}

EmbedlyCard.propTypes = {
  link: PropTypes.string,
  authorizedToEdit: PropTypes.bool,
  removeLink: PropTypes.func
}

export default EmbedlyCard

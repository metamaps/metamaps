import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ContextMenu from '../containers/ContextMenu'
import UpperOptions from '../containers/UpperOptions'
import InfoAndHelp from '../containers/InfoAndHelp'
import VisualizationControls from '../containers/VisualizationControls'
import TopicCard from '../containers/TopicCard'

import TopicVis from '../components/TopicVis'

export default class TopicView extends Component {

  static propTypes = {
    contextMenu: PropTypes.bool,
    mobile: PropTypes.bool,
    topicId: PropTypes.string,
    topic: PropTypes.object,
    filterData: PropTypes.object,
    allForFiltering: PropTypes.object,
    visibleForFiltering: PropTypes.object,
    toggleMetacode: PropTypes.func,
    toggleMapper: PropTypes.func,
    toggleSynapse: PropTypes.func,
    filterAllMetacodes: PropTypes.func,
    filterAllMappers: PropTypes.func,
    filterAllSynapses: PropTypes.func,
    currentUser: PropTypes.object,
    endActiveTopic: PropTypes.func,
    launchNewTopic: PropTypes.func,
    openHelpLightbox: PropTypes.func,
    forkMap: PropTypes.func,
    onZoomIn: PropTypes.func,
    onZoomOut: PropTypes.func
  }

  componentWillUnmount() {
    this.endTopic()
  }

  endTopic() {
    // TODO: fix upperOptions ref
    this.upperOptions.reset()
    this.props.endActiveTopic()
  }

  componentDidUpdate(prevProps) {
    const oldTopicId = prevProps.topicId
    const { topicId, launchNewTopic } = this.props
    if (!oldTopicId && topicId) launchNewTopic(topicId)
    else if (oldTopicId && topicId && oldTopicId !== topicId) {
      this.endTopic()
      launchNewTopic(topicId)
    }
    else if (oldTopicId && !topicId) this.endTopic()
  }

  render = () => {
    const { mobile, topic, currentUser, allForFiltering, visibleForFiltering,
            toggleMetacode, toggleMapper, toggleSynapse, filterAllMetacodes,
            filterAllMappers, filterAllSynapses, filterData, forkMap,
            openHelpLightbox, onZoomIn, onZoomOut, contextMenu } = this.props
    // TODO: stop using {...this.props} and make explicit
    return <div className="topicWrapper">
      <UpperOptions ref={x => this.upperOptions = x} {...this.props} />
      <TopicVis />
      <TopicCard {...this.props} />
      {contextMenu && <ContextMenu {...this.props} />}
      <VisualizationControls {...this.props} />
      <InfoAndHelp {...this.props} />
    </div>
  }
}

import React, { Component, PropTypes } from 'react'

import DataVis from '../common/DataVis'
import UpperOptions from '../common/UpperOptions'
import InfoAndHelp from '../common/InfoAndHelp'
import VisualizationControls from '../common/VisualizationControls'
import TopicCard from '../TopicCard'

export default class TopicView extends Component {

  static propTypes = {
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
            openHelpLightbox, onZoomIn, onZoomOut } = this.props
    // TODO: stop using {...this.props} and make explicit
    return <div className="topicWrapper">
      <UpperOptions ref={x => this.upperOptions = x}
                    currentUser={currentUser}
                    topic={topic}
                    onForkClick={forkMap}
                    filterData={filterData}
                    allForFiltering={allForFiltering}
                    visibleForFiltering={visibleForFiltering}
                    toggleMetacode={toggleMetacode}
                    toggleMapper={toggleMapper}
                    toggleSynapse={toggleSynapse}
                    filterAllMetacodes={filterAllMetacodes}
                    filterAllMappers={filterAllMappers}
                    filterAllSynapses={filterAllSynapses} />
      <DataVis />
      <TopicCard {...this.props} />
      <VisualizationControls onClickZoomIn={onZoomIn}
                             onClickZoomOut={onZoomOut} />
      <InfoAndHelp topic={topic}
                   onHelpClick={openHelpLightbox} />
    </div>
  }
}

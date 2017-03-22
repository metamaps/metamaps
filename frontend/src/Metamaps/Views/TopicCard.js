/* global $ */

import Active from '../Active'
import Visualize from '../Visualize'
import GlobalUI, { ReactApp } from '../GlobalUI'

const TopicCard = {
  openTopic: null, // stores the topic that's currently open
  metacodeSets: [],
  init: function(serverData) {
    const self = TopicCard
    self.metacodeSets = serverData.metacodeSets
  },
  onTopicFollow: topic => {
    const self = TopicCard
    const isFollowing = topic.isFollowedBy(Active.Mapper)
    $.post({
      url: `/topics/${topic.id}/${isFollowing ? 'un' : ''}follow`
    })
    if (isFollowing) {
      GlobalUI.notifyUser('You are no longer following this topic')
      Active.Mapper.unfollowTopic(topic.id)
    } else {
      GlobalUI.notifyUser('You are now following this topic')
      Active.Mapper.followTopic(topic.id)
    }
    self.render()
  },
  updateTopic: (topic, obj) => {
    const self = TopicCard
    topic.save(obj, { success: self.render })
  },
  render: function() {
    ReactApp.render()
  },
  showCard: function(node, opts = {}) {
    var self = TopicCard
    var topic = node.getData('topic')
    self.openTopic = topic
    self.render()
  },
  hideCard: function() {
    var self = TopicCard
    self.openTopic = null
    self.render()
  }
}

export default TopicCard

import { ReactApp } from '../GlobalUI'

const TopicCard = {
  openTopic: null,
  showCard: function(node) {
    TopicCard.openTopic = node.getData('topic')
    ReactApp.render()
  },
  hideCard: function() {
    TopicCard.openTopic = null
    ReactApp.render()
  }
}

export default TopicCard

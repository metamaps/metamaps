/* global $ */

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
  },
  uploadAttachment: (topic, file) => {
    const data = new window.FormData()
    data.append('attachment[file]', file)
    data.append('attachment[attachable_type]', 'Topic')
    data.append('attachment[attachable_id]', topic.id)
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/attachments',
        type: 'POST',
        data,
        processData: false,
        contentType: false,
        success: (data) => {
          console.log('file upolad success', data)
          topic.fetch({ success: () => {
            ReactApp.render()
            resolve(true)
          }})
        },
        error: (error) => {
          console.error(error)
          window.alert('File upload failed')
          topic.fetch({ success: () => {
            ReactApp.render()
            resolve(false)
          }})
        }
      })
    })
  },
  removeAttachment: (topic) => {
    const attachments = topic.get('attachments')
    if (!attachments || attachments.length < 1) {
      return
    }

    $.ajax({
      url: `/attachments/${attachments[0].id}`,
      type: 'DELETE',
      success: () => {
        console.log('delete success, syncing topic')
        topic.fetch({ success: () => ReactApp.render() })
      },
      error: error => {
        console.error(error)
        window.alert('Failed to remove attachment')
        topic.fetch({ success: () => ReactApp.render() })
      }
    })
  }
}

export default TopicCard

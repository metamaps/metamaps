# frozen_string_literal: true
class ApplicationMailer < ActionMailer::Base
  default from: 'team@metamaps.cc'
  layout 'mailer'

  def deliver
    raise NotImplementedError('Please use Mailboxer to send your emails.')
  end

  class << self
    def mail_for_notification(notification)
      case notification.notification_code
        when MAP_ACCESS_REQUEST
          request = notification.notified_object
          MapMailer.access_request(request)
        when MAP_ACCESS_APPROVED
          request = notification.notified_object
          MapMailer.access_approved(request)
        when MAP_INVITE_TO_EDIT
          user_map = notification.notified_object
          MapMailer.invite_to_edit(user_map)
        when TOPIC_ADDED_TO_MAP
          event = notification.notified_object
          TopicMailer.added_to_map(event, notification.recipients[0])
        when TOPIC_CONNECTED_1
          synapse = notification.notified_object
          TopicMailer.connected(synapse, synapse.topic1, notification.recipients[0])
        when TOPIC_CONNECTED_2
          synapse = notification.notified_object
          TopicMailer.connected(synapse, synapse.topic2, notification.recipients[0])
      end
    end
  end
end

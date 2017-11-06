# frozen_string_literal: true

class NotificationDecorator
  class << self
    def decorate(notification, receipt)
      result = {
        id: notification.id,
        type: notification.notification_code,
        subject: notification.subject,
        is_read: receipt.is_read,
        created_at: notification.created_at,
        actor: notification.sender,
        data: {
          object: notification.notified_object
        }
      }

      case notification.notification_code
      when MAP_ACCESS_APPROVED, MAP_ACCESS_REQUEST, MAP_INVITE_TO_EDIT
        map = notification.notified_object&.map
        result[:data][:map] = {
          id: map&.id,
          name: map&.name
        }
      when TOPIC_ADDED_TO_MAP
        topic = notification.notified_object&.eventable
        map = notification.notified_object&.map
        result[:data][:topic] = {
          id: topic&.id,
          name: topic&.name
        }
        result[:data][:map] = {
          id: map&.id,
          name: map&.name
        }
      when TOPIC_CONNECTED_1, TOPIC_CONNECTED_2
        topic1 = notification.notified_object&.topic1
        topic2 = notification.notified_object&.topic2
        result[:data][:topic1] = {
          id: topic1&.id,
          name: topic1&.name
        }
        result[:data][:topic2] = {
          id: topic2&.id,
          name: topic2&.name
        }
      end
      result
    end
  end
end

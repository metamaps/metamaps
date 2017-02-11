# frozen_string_literal: true
module Events
  class TopicAddedToMap < Event
    after_create :notify_users!

    def self.publish!(topic, map, user, meta)
      create!(kind: 'topic_added_to_map',
              eventable: topic,
              map: map,
              user: user,
              meta: meta)
    end
    
    def notify_users!
      # in the future, notify followers of both the topic, and the map
      NotificationService.notify_followers(eventable, TOPIC_ADDED_TO_MAP, self)
      # NotificationService.notify_followers(map, MAP_RECEIVED_TOPIC, self)
    end
    handle_asynchronously :notify_users!
  end
end

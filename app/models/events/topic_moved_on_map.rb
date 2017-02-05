# frozen_string_literal: true
module Events
  class TopicMovedOnMap < Event
    # after_create :notify_users!

    def self.publish!(topic, map, user, meta)
      create!(kind: 'topic_moved_on_map',
              eventable: topic,
              map: map,
              user: user,
              meta: meta)
    end
  end
end

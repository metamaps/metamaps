# frozen_string_literal: true
module Events
  class TopicRemovedFromMap < Event
    # after_create :notify_users!

    def self.publish!(topic, map, user, meta)
      create!(kind: 'topic_removed_from_map',
              eventable: topic,
              map: map,
              user: user,
              meta: meta)
    end
  end
end

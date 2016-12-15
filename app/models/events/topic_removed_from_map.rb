# frozen_string_literal: true
class Events::TopicRemovedFromMap < Event
  # after_create :notify_users!

  def self.publish!(topic, map, user)
    create!(kind: 'topic_removed_from_map',
            eventable: topic,
            map: map,
            user: user)
  end
end

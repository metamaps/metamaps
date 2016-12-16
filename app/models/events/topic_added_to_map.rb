# frozen_string_literal: true
class Events::TopicAddedToMap < Event
  # after_create :notify_users!

  def self.publish!(topic, map, user, meta)
    create!(kind: 'topic_added_to_map',
            eventable: topic,
            map: map,
            user: user,
            meta: meta)
  end
end

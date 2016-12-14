# frozen_string_literal: true
class Events::TopicAddedToMap < Event
  # after_create :notify_users!

  def self.publish!(mapping, user, meta)
    create!(kind: 'topic_added_to_map',
            eventable: mapping,
            map: mapping.map,
            user: user,
            meta: meta)
  end
end

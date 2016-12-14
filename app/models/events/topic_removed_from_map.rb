# frozen_string_literal: true
class Events::TopicRemovedFromMap < Event
  # after_create :notify_users!

  def self.publish!(mapping, user)
    create!(kind: 'topic_removed_from_map',
            eventable: mapping,
            map: mapping.map,
            user: user)
  end
end

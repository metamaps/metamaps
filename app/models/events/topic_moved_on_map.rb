# frozen_string_literal: true
class Events::TopicMovedOnMap < Event
  # after_create :notify_users!

  def self.publish!(mapping, user, meta)
    create!(kind: 'topic_moved_on_map',
            eventable: mapping,
            map: mapping.map,
            user: user,
            meta: meta)
  end
end

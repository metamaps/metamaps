# frozen_string_literal: true
class Events::TopicUpdated < Event
  # after_create :notify_users!

  def self.publish!(topic, user, meta)
    create!(kind: 'topic_updated',
            eventable: topic,
            user: user,
            meta: meta)
  end
end

# frozen_string_literal: true

# Preview all emails at http://localhost:3000/rails/mailers/topic_mailer
class TopicMailerPreview < ActionMailer::Preview
  def added_to_map
    event = Event.where(kind: 'topic_added_to_map').first
    user = User.first
    TopicMailer.added_to_map(event, user)
  end

  def connected
    synapse = Synapse.first
    topic = synapse.topic1
    user = User.first
    TopicMailer.connected(synapse, topic, user)
  end
end

# frozen_string_literal: true
class TopicMailer < ApplicationMailer
  include TopicMailerHelper
  default from: 'team@metamaps.cc'

  def added_to_map(event, user)
    @entity = event.eventable
    @event = event
    mail(to: user.email, subject: added_to_map_subject(@entity, event.map))
  end

  def connected(synapse, topic, user)
    @entity = topic
    @event = synapse
    mail(to: user.email, subject: connected_subject(topic))
  end
end

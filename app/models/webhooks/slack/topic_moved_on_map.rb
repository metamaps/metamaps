# frozen_string_literal: true
class Webhooks::Slack::TopicMovedOnMap < Webhooks::Slack::Base
  def text
    "*#{eventable.name}* was moved by *#{event.user.name}* on the map *#{view_map_on_metamaps}*"
  end
end

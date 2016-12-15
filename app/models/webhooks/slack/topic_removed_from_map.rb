# frozen_string_literal: true
class Webhooks::Slack::TopicRemovedFromMap < Webhooks::Slack::Base
  def text
    "*#{eventable.name}* was removed by *#{event.user.name}* from the map *#{view_map_on_metamaps}*"
  end
end

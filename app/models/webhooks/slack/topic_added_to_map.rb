# frozen_string_literal: true
class Webhooks::Slack::TopicAddedToMap < Webhooks::Slack::Base
  def text
    "*#{eventable.name}* was added by *#{event.user.name}* to the map *#{view_map_on_metamaps}*"
  end
  # TODO: it would be sweet if it sends it with the metacode as the icon_url
end

# frozen_string_literal: true

class Webhooks::Slack::SynapseAddedToMap < Webhooks::Slack::Base
  def text
    connector = eventable.desc.empty? ? '->' : eventable.desc
    "\"*#{eventable.topic1.name}* #{connector} *#{eventable.topic2.name}*\"" \
      " was added as a connection by *#{event.user.name}*" \
      " to the map *#{view_map_on_metamaps}*"
  end
end

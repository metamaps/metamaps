# frozen_string_literal: true
class Webhooks::Slack::SynapseAddedToMap < Webhooks::Slack::Base
  def text
    connector = eventable.mappable.desc.empty? ? '->' : eventable.mappable.desc
    "\"*#{eventable.mappable.topic1.name}* #{connector} *#{eventable.mappable.topic2.name}*\" was added as a connection by *#{event.user.name}* to the map *#{view_map_on_metamaps}*"
  end
end

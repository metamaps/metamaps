# frozen_string_literal: true
class Webhooks::Slack::SynapseRemovedFromMap < Webhooks::Slack::Base
  def text
    connector = eventable.desc.empty? ? '->' : eventable.desc
    # todo express correct directionality of arrows when desc is empty
    "\"*#{eventable.topic1.name}* #{connector} *#{eventable.topic2.name}*\" was removed by *#{event.user.name}* as a connection from the map *#{view_map_on_metamaps}*"
  end
end

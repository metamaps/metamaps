# frozen_string_literal: true
class Webhooks::Slack::ConversationStartedOnMap < Webhooks::Slack::Base
  def text
    "There is a live conversation starting on map *#{event.map.name}*. #{view_map_on_metamaps('Join in!')}"
  end
end

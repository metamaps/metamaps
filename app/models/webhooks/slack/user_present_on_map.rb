# frozen_string_literal: true
class Webhooks::Slack::UserPresentOnMap < Webhooks::Slack::Base
  def text
    "Mapper *#{event.user.name}* has joined the map *#{event.map.name}*. #{view_map_on_metamaps('Map with them')}"
  end
end

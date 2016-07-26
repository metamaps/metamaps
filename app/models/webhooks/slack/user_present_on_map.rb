class Webhooks::Slack::UserPresentOnMap < Webhooks::Slack::Base
  def text
    "Mapper *#{event.user.name}* has joined the map *#{event.map.name}*. #{view_map_on_metamaps('Map with them')}"
  end
  # TODO: it would be sweet if it sends it with the metacode as the icon_url

  def attachment_fallback
    '' # {}"*#{eventable.name}*\n#{eventable.description}\n"
  end

  def attachment_title
    '' # proposal_link(eventable)
  end

  def attachment_text
    '' # "#{eventable.description}\n"
  end

  def attachment_fields
    [{
      title: 'nothing',
      value: 'nothing'
    }] # [motion_vote_field]
  end
end

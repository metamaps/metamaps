class Webhooks::Slack::TopicAddedToMap < Webhooks::Slack::Base
  def text
    "New #{eventable.mappable.metacode.name} topic *#{eventable.mappable.name}* was added to the map *#{view_map_on_metamaps}*"
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

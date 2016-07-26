class Webhooks::Slack::SynapseAddedToMap < Webhooks::Slack::Base
  def text
    "\"*#{eventable.mappable.topic1.name}* #{eventable.mappable.desc || '->'} *#{eventable.mappable.topic2.name}*\" was added as a connection to the map *#{view_map_on_metamaps}*"
  end

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

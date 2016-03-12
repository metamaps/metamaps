class Webhooks::Slack::TopicAddedToMap < Webhooks::Slack::Base

  def text
    "New #{eventable.topic.metacode.name} topic *#{eventable.topic.name}* was added to the map *#{view_map_on_metamaps()}*"
  end

  def icon_url
    eventable.topic.metacode.icon
  end

  def attachment_fallback
    "" #{}"*#{eventable.name}*\n#{eventable.description}\n"
  end

  def attachment_title
    "" #proposal_link(eventable)
  end

  def attachment_text
    "" # "#{eventable.description}\n"
  end

  def attachment_fields
    [{
      title: "nothing",
      value: "nothing"
    }] #[motion_vote_field]
  end

end

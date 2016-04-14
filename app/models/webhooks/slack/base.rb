Webhooks::Slack::Base = Struct.new(:event) do
  include Routing

  def username
    "Metamaps Bot"
  end

  def icon_url
    "https://pbs.twimg.com/profile_images/539300245029392385/dJ1bwnw7.jpeg"
  end

  def text
    "something"
  end

  def attachments
    [{
      title:       attachment_title,
      text:        attachment_text,
      fields:      attachment_fields,
      fallback:    attachment_fallback
    }]
  end

  alias :read_attribute_for_serialization :send

  private

  #def motion_vote_field
  #  {
  #    title: "Vote on this proposal",
  #    value: "#{proposal_link(eventable, "yes")} · " +
  #           "#{proposal_link(eventable, "abstain")} · " +
  #           "#{proposal_link(eventable, "no")} · " +
  #           "#{proposal_link(eventable, "block")}"
  #  }
  #end

  def view_map_on_metamaps(text = nil)
    "<#{map_url(event.map)}|#{text || event.map.name}>"
  end

  #def view_discussion_on_loomio(params = {})
  #  { value: discussion_link(I18n.t(:"webhooks.slack.view_it_on_loomio"), params) }
  #end

  #def proposal_link(proposal, position = nil)
  #  discussion_link position || proposal.name, { proposal: proposal.key, position: position }
  #end

  #def discussion_link(text = nil, params = {})
  #  "<#{discussion_url(eventable.map, params)}|#{text || eventable.discussion.title}>"
  #end

  def eventable
    @eventable ||= event.eventable
  end

  def author
    @author ||= eventable.author
  end

end

#webhooks:
#    slack:
#      motion_closed: "*%{name}* has closed"
#      motion_closing_soon: "*%{name}* has a proposal closing in 24 hours"
#      motion_outcome_created: "*%{author}* published an outcome in *%{name}*"
#      motion_outcome_updated: "*%{author}* updated the outcome for *%{name}*"
#      new_motion: "*%{author}* started a new proposal in *%{name}*"
#      view_it_on_loomio: "View it on Loomio"

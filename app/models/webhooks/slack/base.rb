# frozen_string_literal: true
Webhooks::Slack::Base = Struct.new(:webhook, :event) do
  include Routing

  def username
    'Metamaps Bot'
  end

  def icon_url
    'https://pbs.twimg.com/profile_images/539300245029392385/dJ1bwnw7.jpeg'
  end

  def text
    'something'
  end

  delegate :channel, to: :webhook

  alias_method :read_attribute_for_serialization, :send

  private

  def view_map_on_metamaps(text = nil)
    "<#{map_url(event.map)}|#{text || event.map.name}>"
  end

  def eventable
    @eventable ||= event.eventable
  end

  def author
    @author ||= eventable.author
  end
end

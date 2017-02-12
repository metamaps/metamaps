# frozen_string_literal: true
module TopicMailerHelper
  def added_to_map_subject(topic, map)
    topic.name + ' was added to map ' + map.name
  end

  def connected_subject(topic)
    'new synapse to topic ' + topic.name
  end
end
class Events::NewMapping < Event
  # after_create :notify_users!

  def self.publish!(mapping, user)
    create!(kind: mapping.mappable_type == 'Topic' ? 'topic_added_to_map' : 'synapse_added_to_map',
            eventable: mapping,
            map: mapping.map,
            user: user)
  end
end

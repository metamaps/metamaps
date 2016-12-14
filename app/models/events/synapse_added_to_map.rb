# frozen_string_literal: true
class Events::SynapseAddedToMap < Event
  # after_create :notify_users!

  def self.publish!(mapping, user)
    create!(kind: 'synapse_added_to_map',
            eventable: mapping,
            map: mapping.map,
            user: user)
  end
end

# frozen_string_literal: true
class Events::SynapseRemovedFromMap < Event
  # after_create :notify_users!

  def self.publish!(synapse, map, user)
    create!(kind: 'synapse_removed_from_map',
            eventable: synapse,
            map: map,
            user: user)
  end
end

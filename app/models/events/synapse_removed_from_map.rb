# frozen_string_literal: true
class Events::SynapseRemovedFromMap < Event
  # after_create :notify_users!

  def self.publish!(mapping, user)
    create!(kind: 'synapse_removed_from_map',
            eventable: mapping,
            map: mapping.map,
            user: user)
  end
end

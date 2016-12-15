# frozen_string_literal: true
class Events::SynapseRemovedFromMap < Event
  # after_create :notify_users!

  def self.publish!(synapse, map, user, meta)
    create!(kind: 'synapse_removed_from_map',
            eventable: synapse,
            map: map,
            user: user,
            meta: meta)
  end
end

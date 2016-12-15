# frozen_string_literal: true
class Events::SynapseAddedToMap < Event
  # after_create :notify_users!

  def self.publish!(synapse, map, user, meta)
    create!(kind: 'synapse_added_to_map',
            eventable: synapse,
            map: map,
            user: user,
            meta: meta)
  end
end

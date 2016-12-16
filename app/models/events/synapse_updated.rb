# frozen_string_literal: true
class Events::SynapseUpdated < Event
  # after_create :notify_users!

  def self.publish!(synapse, user, meta)
    create!(kind: 'synapse_updated',
            eventable: synapse,
            user: user,
            meta: meta)
  end
end

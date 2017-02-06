# frozen_string_literal: true
module Events
  class UserNotPresentOnMap < Event
    # after_create :notify_users!

    def self.publish!(map, user)
      create!(kind: 'user_not_present_on_map',
              eventable: map,
              map: map,
              user: user)
    end
  end
end

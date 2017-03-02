# frozen_string_literal: true
class ActivityService

  def self.send_activity_for_followers(map, reason_filter = nil)
    follows = FollowService.get_follows_for_entity(map, nil, reason_filter)

    # generate the full set of activity here

    follows.each{|follow|
      # check here whether this person needs to receive anything
      # related to the activity that occurred on the map

      body = NotificationService.renderer.render(template: 'template', locals: {}, layout: false)
      follow.user.notify('subject', body, event, false, MAP_ACTIVITY, follow.user.emails_allowed, ??)
    }
  end
  
end
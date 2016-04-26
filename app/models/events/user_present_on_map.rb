class Events::UserPresentOnMap < Event
  #after_create :notify_users!

  def self.publish!(map, user)
    create!(kind: "user_present_on_map",
            eventable: map,
            map: map,
            user: user)
  end

  private

  #def notify_users!
  #  unless comment_vote.user == comment_vote.comment_user
  #    notify!(comment_vote.comment_user)
  #  end
  #end
end

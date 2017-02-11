# frozen_string_literal: true
class FollowService
  

  def self.follow(entity, user, reason)

    #return unless is_tester(user)

    follow = Follow.where(followed: entity, user: user).first_or_create
    if FollowReason::REASONS.include?(reason) && !follow.follow_reason.read_attribute(reason)
      follow.follow_reason.update_attribute(reason, true)
    end
  end
  
  def self.unfollow(entity, user)
    Follow.where(followed: entity, user: user).destroy_all
  end
  
  def self.remove_reason(entity, user, reason)
    return unless FollowReason::REASONS.include?(reason)
    follow = Follow.where(followed: entity, user: user).first
    if follow
      follow.follow_reason.update_attribute(reason, false)
      if !follow.follow_reason.has_reason
        follow.destroy
      end
    end
  end
  
  protected
  
  def is_tester(user)
    %w(connorturland@gmail.com devin@callysto.com chessscholar@gmail.com solaureum@gmail.com ishanshapiro@gmail.com).include?(user.email)
  end
end

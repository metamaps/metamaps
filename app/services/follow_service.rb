# frozen_string_literal: true
class FollowService
  class << self 
    def follow(entity, user, reason)

      return unless user

      return if (reason == 'created' || reason == 'contributed') && !should_auto_follow(entity, user, reason)

      follow = Follow.where(followed: entity, user: user).first_or_create
      if FollowReason::REASONS.include?(reason) && !follow.follow_reason.read_attribute(reason)
        follow.follow_reason.update_attribute(reason, true)
      end
    end

    def unfollow(entity, user)
      Follow.where(followed: entity, user: user).destroy_all
    end

    def remove_reason(entity, user, reason)
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

    def should_auto_follow(entity, user, reason)
      if entity.class == Topic
        if reason == 'created'
          return user.settings.follow_topic_on_created == '1'
        elsif reason == 'contributed'
          return user.settings.follow_topic_on_contributed == '1'
        end
      elsif entity.class == Map
        if reason == 'created'
          return user.settings.follow_map_on_created == '1'
        elsif reason == 'contributed'
          return user.settings.follow_map_on_contributed == '1'
        end
      end
    end
  end
end

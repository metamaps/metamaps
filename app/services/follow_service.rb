# frozen_string_literal: true

class FollowService
  class << self
    def follow(entity, user, reason)
      return unless user

      return if (reason == 'created' || reason == 'contributed') && !should_auto_follow(entity, user, reason)

      follow = Follow.where(followed: entity, user: user).first_or_create
      unless follow.update(muted: false)
        raise follow.errors.full_messages.join("\n")
      end
      if FollowReason::REASONS.include?(reason) && !follow.follow_reason.read_attribute(reason)
        follow.follow_reason.update_attribute(reason, true)
      end
    end

    def unfollow(entity, user)
      follow = Follow.where(followed: entity, user: user).first
      return unless follow

      unless follow.update(muted: true)
        raise follow.errors.full_messages.join("\n")
      end
    end

    def remove_reason(entity, user, reason)
      return unless FollowReason::REASONS.include?(reason)
      follow = Follow.where(followed: entity, user: user).first
      return unless follow

      follow.follow_reason.update_attribute(reason, false)
      follow.destroy unless follow.follow_reason.has_reason
    end

    protected

    def should_auto_follow(entity, user, reason)
      follow = Follow.where(followed: entity, user: user).first
      return false if follow && follow.muted
      if entity.class == Topic
        return user.settings.follow_topic_on_created == '1' if reason == 'created'
        return user.settings.follow_topic_on_contributed == '1' if reason == 'contributed'
      elsif entity.class == Map
        return user.settings.follow_map_on_created == '1' if reason == 'created'
        return user.settings.follow_map_on_contributed == '1' if reason == 'contributed'
      end
    end
  end
end

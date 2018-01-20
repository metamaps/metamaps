# frozen_string_literal: true

class TopicPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.where(permission: %w[public commons]) unless user

      scope.where(permission: %w[public commons])
           .or(scope.where(defer_to_map_id: user.all_accessible_maps.map(&:id)))
           .or(scope.where(user_id: user.id))
    end
  end

  def index?
    true
  end

  def create?
    user.present?
  end

  def show?
    if record.defer_to_map.present?
      map_policy.show?
    else
      record.permission.in?(%w[commons public]) || record.user == user
    end
  end

  def update?
    return false if user.blank?
    if record.defer_to_map.present?
      map_policy.update?
    else
      record.permission == 'commons' || record.user == user
    end
  end

  def destroy?
    record.user == user || admin_override
  end

  def autocomplete_topic?
    user.present?
  end

  def network?
    show?
  end

  def relative_numbers?
    show?
  end

  def relatives?
    show?
  end

  def follow?
    show? && user.present?
  end

  def unfollow?
    user.present?
  end

  def unfollow_from_email?
    user.present?
  end

  # Helpers
  def map_policy
    @map_policy ||= Pundit.policy(user, record.defer_to_map)
  end
end

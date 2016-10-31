# frozen_string_literal: true
class TopicPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = %w(public commons)
      return scope.where(permission: visible) unless user

      scope.where(permission: visible)
           .or(scope.where.not(defer_to_map_id: nil).where(defer_to_map_id: user.all_accessible_maps.map(&:id)))
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
      record.permission.in?(['commons', 'public']) || record.user == user
    end
  end

  def update?
    return false unless user.present?
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

  # Helpers
  def map_policy
    @map_policy ||= Pundit.policy(user, record.defer_to_map)
  end
end

# frozen_string_literal: true

class MessagePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = %w[public commons]
      permission = 'maps.permission IN (?)'
      return scope.joins(:map).where(permission, visible) unless user

      # if this is getting changed, the policy_scope for mappings should also be changed
      # as it is based entirely on the map to which it belongs
      scope.joins(:map).where(permission, visible)
           .or(scope.joins(:map).where('maps.id IN (?)', user.shared_maps.map(&:id)))
           .or(scope.joins(:map).where('maps.user_id = ?', user.id))
    end
  end

  delegate :show?, to: :resource_policy

  def create?
    # we have currently decided to let any map that is visible to someone be commented on by them
    record.resource.present? && resource_policy.show?
  end

  def update?
    record.user == user
  end

  def destroy?
    record.user == user || admin_override
  end

  # Helpers

  def resource_policy
    @resource_policy ||= Pundit.policy(user, record.resource)
  end
end

# frozen_string_literal: true

class MappingPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      # TODO: base this on the map policy
      # it would be nice if we could also base this on the mappable, but that
      # gets really complicated. Devin thinks it's OK to SHOW a mapping for
      # a private topic, since you can't see the private topic anyways
      visible = %w[public commons]
      permission = 'maps.permission IN (?)'
      return scope.joins(:map).where(permission, visible) unless user

      # if this is getting changed, the policy_scope for messages should also be changed
      # as it is based entirely on the map to which it belongs
      scope.joins(:map).where(permission, visible)
           .or(scope.joins(:map).where('maps.id IN (?)', user.shared_maps.map(&:id)))
           .or(scope.joins(:map).where('maps.user_id = ?', user.id))
    end
  end

  def index?
    true
  end

  def show?
    map_policy.show? && mappable_policy.try(:show?)
  end

  def create?
    record.map.present? && map_policy.update?
  end

  def update?
    record.mappable_type == 'Topic' && map_policy.update?
  end

  def destroy?
    map_policy.update? || admin_override
  end

  # Helpers

  def map_policy
    @map_policy ||= Pundit.policy(user, record.map)
  end

  def mappable_policy
    @mappable_policy ||= Pundit.policy(user, record.mappable)
  end
end

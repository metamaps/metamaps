class SynapsePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = %w(public commons)
      permission = 'synapses.permission IN (?)'
      if user
        scope.where(permission + ' OR synapses.defer_to_map_id IN (?) OR synapses.user_id = ?', visible, user.shared_maps.map(&:id), user.id)
      else
        scope.where(permission, visible)
      end
    end
  end

  def create?
    user.present?
    # TODO: add validation against whether you can see both topics
  end

  def show?
    if record.defer_to_map.present?
      map_policy.show?
    else
      record.permission == 'commons' || record.permission == 'public' || record.user == user
    end
  end

  def update?
    if !user.present?
      false
    elsif record.defer_to_map.present?
      map_policy.update?
    else
      record.permission == 'commons' || record.user == user
    end
  end

  def destroy?
    record.user == user || admin_override
  end

  # Helpers
  def map_policy
    @map_policy ||= Pundit.policy(user, record.defer_to_map)
  end
end

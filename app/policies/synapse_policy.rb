class SynapsePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = ['public', 'commons']
      permission = 'synapses.permission IN (?)'
      if user
        scope.where(permission + ' OR synapses.user_id = ?', visible, user.id)
      else
        scope.where(permission, visible)
      end
    end
  end

  def create?
    user.present?
    # todo add validation against whether you can see both topics
  end

  def show?
    record.permission == 'commons' || record.permission == 'public' || record.user == user
  end

  def update?
    user.present? && (record.permission == 'commons' || record.user == user)
  end

  def destroy?
    record.user == user || admin_override
  end
end

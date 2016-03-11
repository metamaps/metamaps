class SynapsePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where('permission IN ("public", "commons") OR user_id = ?', user.id)
    end
  end

  def create?
    user.present?
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

class MappingPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      # TODO base this on the map policy
      # it would be nice if we could also base this on the mappable, but that
      # gets really complicated. Devin thinks it's OK to SHOW a mapping for
      # a private topic, since you can't see the private topic anyways
      visible = ['public', 'commons']
      permission = 'maps.permission IN (?)'
      if user
        scope.joins(:maps).where(permission + ' OR maps.user_id = ?', visible, user.id)
      else
        scope.where(permission, visible)
      end 
    end
  end

  def show?
    map = Pundit.policy(user, record.map)
    mappable = Pundit.policy(user, record.mappable)
    map.show? && mappable.show?
  end

  def create?
    Pundit.policy(user, record.map).update?
  end

  def update?
    Pundit.policy(user, record.map).update?
  end

  def destroy?
    record.user == user || admin_override
  end
end

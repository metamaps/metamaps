class MappingPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      # TODO base this on the map policy
      # it would be nice if we could also base this on the mappable, but that
      # gets really complicated. Devin thinks it's OK to SHOW a mapping for
      # a private topic, since you can't see the private topic anyways
      scope.joins(:maps).where('maps.permission IN (?) OR maps.user_id = ?',
                                 ["public", "commons"], user.id)
    end
  end

  def show?
    map = policy(record.map, user)
    mappable = policy(record.mappable, user)
    map.show? && mappable.show?
  end

  def create?
    map = policy(record.map, user)
    map.update?
  end

  def update?
    map = policy(record.map, user)
    map.update?
  end

  def destroy?
    record.user == user || admin_override
  end
end

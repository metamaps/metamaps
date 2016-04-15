class MapPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = ['public', 'commons']
      permission = 'maps.permission IN (?)'
      if user
        scope.where(permission + ' OR maps.user_id = ?', visible, user.id)
      else
        scope.where(permission, visible)
      end
    end
  end

  def activemaps?
    user.blank? # redirect to root url if authenticated for some reason
  end

  def featuredmaps?
    true
  end

  def mymaps?
    user.present?
  end

  def usermaps?
    true
  end

  def show?
    record.permission == 'commons' || record.permission == 'public' || record.user == user
  end

  def export?
    show?
  end

  def events?
    show?
  end

  def contains?
    show?
  end

  def create?
    user.present?
  end

  def update?
    user.present? && (record.permission == 'commons' || record.user == user)
  end

  def screenshot?
    update?
  end

  def destroy?
    record.user == user || admin_override
  end
end

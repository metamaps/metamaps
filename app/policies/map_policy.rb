class MapPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = %w(public commons)
      permission = 'maps.permission IN (?)'
      if user
        shared_maps = user.shared_maps.map(&:id)
        scope.where(permission + ' OR maps.id IN (?) OR maps.user_id = ?', visible, shared_maps, user.id)
      else
        scope.where(permission, visible)
      end
    end
  end

  def index?
    true
  end

  def show?
    record.permission == 'commons' || record.permission == 'public' || record.collaborators.include?(user) || record.user == user
  end

  def create?
    user.present?
  end

  def update?
    user.present? && (record.permission == 'commons' || record.collaborators.include?(user) || record.user == user)
  end

  def destroy?
    record.user == user || admin_override
  end

  def access?
    # note that this is to edit access
    user.present? && record.user == user
  end

  def activemaps?
    user.blank? # redirect to root url if authenticated for some reason
  end

  def contains?
    show?
  end

  def events?
    show?
  end

  def export?
    show?
  end

  def featuredmaps?
    true
  end

  def mymaps?
    user.present?
  end

  def star?
    unstar?
  end

  def unstar?
    user.present?
  end

  def screenshot?
    update?
  end

  def usermaps?
    true
  end
end

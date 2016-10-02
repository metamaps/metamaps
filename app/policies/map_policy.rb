# frozen_string_literal: true
class MapPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = %w(public commons)
      return scope.where(permission: visible) unless user

      scope.where(permission: visible)
           .or(scope.where(id: user.shared_maps.map(&:id)))
           .or(scope.where(user_id: user.id))
    end
  end

  def index?
    true
  end

  def show?
    record.permission.in?(['commons', 'public']) ||
      record.collaborators.include?(user) ||
      record.user == user
  end

  def create?
    user.present?
  end

  def update?
    return false unless user.present?
    record.permission == 'commons' ||
      record.collaborators.include?(user) ||
      record.user == user
  end

  def destroy?
    record.user == user || admin_override
  end

  def access?
    # note that this is to edit who can access the map
    user.present? && record.user == user
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

  def star?
    unstar?
  end

  def unstar?
    user.present?
  end
end

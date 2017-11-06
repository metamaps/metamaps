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
    record.permission.in?(%w(commons public)) ||
      record.collaborators.include?(user) ||
      record.user == user
  end

  def conversation?
    show? && %w(connorturland@gmail.com devin@callysto.com chessscholar@gmail.com solaureum@gmail.com ishanshapiro@gmail.com).include?(user.email)
  end

  def create?
    user.present?
  end

  def update?
    return false if user.blank?
    record.permission == 'commons' ||
      record.collaborators.include?(user) ||
      record.user == user
  end

  def destroy?
    record.user == user || admin_override
  end

  def access?
    # this is for the map creator to bulk change who can access the map
    user.present? && record.user == user
  end

  def request_access?
    # this is to access the page where you can request access to a map
    user.present?
  end

  def access_request?
    # this is to actually request access
    user.present?
  end

  def approve_access?
    record.user == user
  end

  def deny_access?
    approve_access?
  end

  def approve_access_post?
    approve_access?
  end

  def deny_access_post?
    approve_access?
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

  def follow?
    show? && user.present?
  end

  def unfollow?
    user.present?
  end

  def unfollow_from_email?
    user.present?
  end
end

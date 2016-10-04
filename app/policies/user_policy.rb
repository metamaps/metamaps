class UserPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    user.present?
  end

  def create?
    fail 'Create should be handled by Devise'
  end

  def update?
    user == record
  end

  def destroy?
    false
  end

  def details?
    show?
  end

  def updatemetacodes?
    update?
  end

  # API action
  def current?
    user == record
  end

  class Scope < Scope
    def resolve
      return scope.all if user.present?
      scope.none
    end
  end
end

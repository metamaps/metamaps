# frozen_string_literal: true
class UserPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def create?
    raise 'Create should be handled by Devise'
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

  def update_metacode_focus?
    update?
  end

  # API action
  def current?
    user == record
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end

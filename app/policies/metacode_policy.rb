# frozen_string_literal: true

class MetacodePolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def create?
    user.is_admin
  end

  def update?
    user.is_admin
  end

  def destroy?
    false
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end

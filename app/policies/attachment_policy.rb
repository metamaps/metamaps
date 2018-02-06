# frozen_string_literal: true

class AttachmentPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(attachable: TopicPolicy::Scope.new(user, Topic).resolve)
    end
  end

  def index?
    true
  end

  def create?
    Pundit.policy(user, record.attachable).update?
  end

  def destroy?
    Pundit.policy(user, record.attachable).update?
  end
end

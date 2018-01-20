# frozen_string_literal: true

class SynapsePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.where(permission: %w[public commons]) unless user

      scope.where(permission: %w[public commons])
           .or(scope.where(defer_to_map_id: user.all_accessible_maps.map(&:id)))
           .or(scope.where(user_id: user.id))
    end
  end

  def index?
    true # really only for the API. should be policy scoped!
  end

  def create?
    if record.try(:topic1) && record.try(:topic2)
      topic1_show? && topic2_show? && user.present?
    else
      # allows us to use policy(Synapse).create?
      user.present?
    end
  end

  def show?
    topic1_show? && topic2_show? && synapse_show?
  end

  def update?
    if user.blank?
      false
    elsif record.defer_to_map.present?
      map_policy.update?
    else
      record.permission == 'commons' || record.user == user
    end
  end

  def destroy?
    record.user == user || admin_override
  end

  # Helpers

  def map_policy
    @map_policy ||= Pundit.policy(user, record.defer_to_map)
  end

  def topic1_show?
    @topic1_policy ||= Pundit.policy(user, record&.topic1)
    @topic1_policy&.show? != false
  end

  def topic2_show?
    @topic2_policy ||= Pundit.policy(user, record&.topic2)
    @topic2_policy&.show? != false
  end

  def synapse_show?
    if record.defer_to_map.present?
      map_policy&.show?
    else
      record.permission == 'commons' || record.permission == 'public' || record.user == user
    end
  end
end

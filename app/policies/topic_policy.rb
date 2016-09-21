class TopicPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = %w(public commons)
      permission = 'topics.permission IN (?)'
      if user
        scope.where(permission + ' OR topics.defer_to_map_id IN (?) OR topics.user_id = ?', visible, user.shared_maps.map(&:id), user.id)
      else
        scope.where(permission, visible)
      end
    end
  end

  def index?
    user.present?
  end

  def create?
    user.present?
  end

  def show?
    if record.defer_to_map.present?
      map_policy.show?
    else
      record.permission == 'commons' || record.permission == 'public' || record.user == user
    end
  end

  def update?
    if !user.present?
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

  def autocomplete_topic?
    user.present?
  end

  def network?
    show?
  end

  def relative_numbers?
    show?
  end

  def relatives?
    show?
  end

  # Helpers
  def map_policy
    @map_policy ||= Pundit.policy(user, record.defer_to_map)
  end
end

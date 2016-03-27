class TopicPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = ['public', 'commons']
      permission = 'topics.permission IN (?)'
      if user
        scope.where(permission + ' OR topics.user_id = ?', visible, user.id)
      else
        scope.where(permission, visible)
      end
    end
  end

  def create?
    user.present?
  end

  def show?
    record.permission == 'commons' || record.permission == 'public' || record.user == user
  end

  def update?
    user.present? && (record.permission == 'commons' || record.user == user)
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
end

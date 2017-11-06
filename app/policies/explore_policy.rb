# frozen_string_literal: true

class ExplorePolicy < ApplicationPolicy
  def active?
    true
  end

  def featured?
    true
  end

  def mine?
    true
  end

  def shared?
    true
  end

  def starred?
    true
  end

  def mapper?
    true
  end
end

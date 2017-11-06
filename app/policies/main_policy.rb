# frozen_string_literal: true

class MainPolicy < ApplicationPolicy
  def home?
    true
  end

  def requestinvite?
    true
  end
end

# frozen_string_literal: true

class SearchPolicy < ApplicationPolicy
  def topics?
    true
  end

  def maps?
    true
  end

  def mappers?
    true
  end

  def synapses?
    true
  end
end

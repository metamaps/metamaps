# frozen_string_literal: true

class HackPolicy < ApplicationPolicy
  def load_url_title?
    true
  end
end

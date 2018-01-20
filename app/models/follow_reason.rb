# frozen_string_literal: true

class FollowReason < ApplicationRecord
  REASONS = %w[created commented contributed followed shared_on starred].freeze

  belongs_to :follow

  validates :follow, presence: true

  def has_reason
    created || commented || contributed || followed || shared_on || starred
  end
end

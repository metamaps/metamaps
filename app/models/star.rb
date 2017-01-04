# frozen_string_literal: true
class Star < ActiveRecord::Base
  belongs_to :user
  belongs_to :map
  validates :map, uniqueness: { scope: :user, message: 'You have already starred this map' }
end

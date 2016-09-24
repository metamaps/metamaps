# frozen_string_literal: true
class Star < ActiveRecord::Base
  belongs_to :user
  belongs_to :map
end

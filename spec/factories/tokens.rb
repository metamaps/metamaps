# frozen_string_literal: true

FactoryBot.define do
  factory :token do
    user
    description ''
  end
end

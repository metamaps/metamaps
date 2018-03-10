# frozen_string_literal: true

FactoryBot.define do
  factory :message do
    association :resource, factory: :map
    user
    sequence(:message) { |n| "Cool Message ##{n}" }
  end
end

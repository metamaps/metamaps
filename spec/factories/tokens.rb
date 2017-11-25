# frozen_string_literal: true

FactoryGirl.define do
  factory :token do
    user
    description ''
  end
end

# frozen_string_literal: true
FactoryGirl.define do
  factory :map do
    sequence(:name) { |n| "Cool Map ##{n}" }
    permission :commons
    arranged { false }
    source_id nil
    desc ''
    user
  end
end

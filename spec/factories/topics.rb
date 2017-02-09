# frozen_string_literal: true
FactoryGirl.define do
  factory :topic do
    user
    association :updated_by, factory: :user
    metacode
    permission :commons
    sequence(:name) { |n| "Cool Topic ##{n}" }
    sequence(:desc) { |n| "topic desc #{n}" }
    sequence(:link) { |n| "https://metamaps.cc/maps/#{n}" }
  end
end

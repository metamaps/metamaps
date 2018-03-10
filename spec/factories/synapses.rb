# frozen_string_literal: true

FactoryBot.define do
  factory :synapse do
    sequence(:desc) { |n| "Cool synapse ##{n}" }
    category :'from-to'
    permission :commons
    association :topic1, factory: :topic
    association :topic2, factory: :topic
    user
    association :updated_by, factory: :user
    weight 1 # TODO: drop this column
  end
end

FactoryGirl.define do
  factory :synapse do
    sequence(:desc) { |n| "Cool synapse ##{n}" }
    category :'from-to'
    permission :commons
    association :topic1, factory: :topic
    association :topic2, factory: :topic
    user
  end
end

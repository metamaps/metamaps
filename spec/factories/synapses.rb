FactoryGirl.define do
  factory :synapse do
    desc { random_string(10) }
    category :to
    permission :commons
    association :topic1, factory: :topic
    association :topic2, factory: :topic
  end
end

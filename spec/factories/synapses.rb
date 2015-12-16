FactoryGirl.define do
  factory :synapse do
    desc { random_string(10) }
    category :to
    permission :commons
    association :node1, factory: :topic
    association :node2, factory: :topic
  end
end

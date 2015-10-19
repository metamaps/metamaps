FactoryGirl.define do
  factory :topic do
    name { random_string(10) }
    permission :commons
  end
end

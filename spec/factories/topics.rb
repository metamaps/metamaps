FactoryGirl.define do
  factory :topic do
    sequence(:name) { |n| "Cool Topic ##{n}" }
    permission :commons
    user
    metacode
  end
end

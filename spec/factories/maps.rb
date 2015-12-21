FactoryGirl.define do
  factory :map do
    sequence(:name) { |n| "Cool Map ##{n}" }
    permission :commons
    arranged { false }
    user
  end
end

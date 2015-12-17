FactoryGirl.define do
  factory :map do
    name { random_string(10) }
    permission :commons
    arranged { false }
    user
  end
end

FactoryGirl.define do
  factory :map do
    name { random_string(10) }
    permission :commons
    user
  end
end

FactoryGirl.define do
  factory :user do
    name { random_string(10) }
    email { random_string(10) + '@' + random_string(10) + '.com' }
    code { random_string(8) }
    joinedwithcode { random_string(8) }
    password 'omgwtfbbq'
  end
end

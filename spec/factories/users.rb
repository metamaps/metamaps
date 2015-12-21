FactoryGirl.define do
  factory :user do
    sequence(:name) { |n| "Cool User ##{n}" }
    sequence(:email) { |n| "cooluser#{n}@cooldomain.com" }
    joinedwithcode { "qwertyui" }
    password 'omgwtfbbq'

    transient do
      validate false
    end

    # bypass validation of the joinedwithcode
    to_create { |instance| instance.save(validate: instance.validate) }
  end
end

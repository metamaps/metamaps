#
# This file supports three factories, because code and joinedwithcode
# make things complicated!
#
# Generally, use :simple_user to generate users. It's simplest.
#
# If you want to test code generation, or need a setup with users that
# have actual codes, you'll need to specify one simple_user and then you
# can specify other :code_user users based on the pre-existing user's code.

FactoryGirl.define do
  factory :code_user, class: User do
    sequence(:name) { |n| "Cool User ##{n}" }
    sequence(:email) { |n| "cooluser#{n}@cooldomain.com" }
    password 'omgwtfbbq'

    factory :simple_user, aliases: [:user] do
      joinedwithcode { "qwertyui" }
      code { "qwertyui" }

      transient do
        validate false
      end

      # bypass validation of the joinedwithcode
      to_create { |instance| instance.save(validate: instance.validate) }
    end
  end
end

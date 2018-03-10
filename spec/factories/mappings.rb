# frozen_string_literal: true

FactoryBot.define do
  factory :mapping do
    xloc 0
    yloc 0
    map
    user
    association :updated_by, factory: :user
    association :mappable, factory: :topic

    factory :mapping_random_location do
      xloc { rand(-100...100) }
      yloc { rand(-100...100) }
    end
  end
end

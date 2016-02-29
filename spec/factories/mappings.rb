FactoryGirl.define do
  factory :mapping do
    xloc 0
    yloc 0
    map
    user
    association :mappable, factory: :topic

    factory :mapping_random_location do
      xloc { rand(-100...100) }
      yloc { rand(-100...100) }
    end
  end
end

FactoryGirl.define do
  factory :mapping do
    xloc 0
    yloc 0
    map
    user
    association :mappable, factory: :topic
  end
end

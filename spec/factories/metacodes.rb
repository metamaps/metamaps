FactoryGirl.define do
  factory :metacode do
    sequence(:name) { |n| "Cool Metacode ##{n}" }
    icon 'https://images.com/image.png'
    color '#cccccc'
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory :metacode do
    sequence(:name) { |n| "Cool Metacode ##{n}" }
    manual_icon 'https://images.com/image.png'
    aws_icon nil
    color '#cccccc'
  end
end

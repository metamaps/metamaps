# frozen_string_literal: true
FactoryGirl.define do
  factory :attachment do
    association :attachable, factory: :topic
  end
end

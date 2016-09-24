# frozen_string_literal: true
module Api
  module V2
    class MetacodeSerializer < ApplicationSerializer
      attributes :id,
                 :name,
                 :manual_icon,
                 :color,
                 :aws_icon
    end
  end
end

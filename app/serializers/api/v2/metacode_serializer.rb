# frozen_string_literal: true

module Api
  module V2
    class MetacodeSerializer < ApplicationSerializer
      attributes :id,
                 :name,
                 :color,
                 :icon
    end
  end
end

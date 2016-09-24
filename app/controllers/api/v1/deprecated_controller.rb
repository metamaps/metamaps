# frozen_string_literal: true
module Api
  module V1
    class DeprecatedController < ApplicationController
      # rubocop:disable Style/MethodMissing
      def method_missing
        render json: { error: '/api/v1 is deprecated! Please use /api/v2 instead.' }
      end
      # rubocop:enable Style/MethodMissing
    end
  end
end

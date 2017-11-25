# frozen_string_literal: true

module Api
  module V1
    class DeprecatedController < ApplicationController
      def deprecated
        render json: {
          error: '/api/v1 has been deprecated! Please use /api/v2 instead.'
        }, status: :gone
      end
    end
  end
end

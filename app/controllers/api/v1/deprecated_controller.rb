module Api
  module V1
    class DeprecatedController < ApplicationController
      def method_missing
        render json: { error: "/api/v1 is deprecated! Please use /api/v2 instead." }
      end
    end
  end
end

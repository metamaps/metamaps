# frozen_string_literal: true
module Api
  module V2
    class MappingsController < WithUpdatesController
      def searchable_columns
        []
      end
    end
  end
end

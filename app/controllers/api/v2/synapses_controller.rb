# frozen_string_literal: true
module Api
  module V2
    class SynapsesController < WithUpdatesController
      def searchable_columns
        [:desc]
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    class MetacodesController < RestfulController
      def searchable_columns
        [:name]
      end
    end
  end
end

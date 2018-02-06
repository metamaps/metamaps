# frozen_string_literal: true

module Api
  module V2
    class AttachmentsController < RestfulController
      def searchable_columns
        [:file]
      end
    end
  end
end

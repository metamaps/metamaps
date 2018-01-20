# frozen_string_literal: true

module Api
  module V2
    class MapsController < WithUpdatesController
      def searchable_columns
        %i[name desc]
      end

      def apply_filters(collection)
        collection = collection.where(user_id: params[:user_id]) if params[:user_id]
        collection
      end
    end
  end
end

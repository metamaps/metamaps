module Api
  module V2
    class MapsController < RestfulController
      def searchable_columns
        [:name, :desc]
      end
    end
  end
end

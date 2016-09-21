module Api
  module V2
    class SynapsesController < RestfulController
      def searchable_columns
        [:desc]
      end
    end
  end
end

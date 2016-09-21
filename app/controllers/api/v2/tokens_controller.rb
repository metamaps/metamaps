module Api
  module V2
    class TokensController < RestfulController
      def my_tokens
        authorize resource_class
        instantiate_collection
        respond_with_collection
      end
    end
  end
end

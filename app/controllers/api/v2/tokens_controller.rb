# frozen_string_literal: true
module Api
  module V2
    class TokensController < RestfulController
      def searchable_columns
        [:description]
      end

      def create
        if params[:token].blank?
          self.resource = resource_class.new
        else
          instantiate_resource
        end

        resource.user = current_user if current_user.present?
        authorize resource
        create_action
        respond_with_resource
      end

      def my_tokens
        authorize resource_class
        instantiate_collection
        respond_with_collection
      end
    end
  end
end

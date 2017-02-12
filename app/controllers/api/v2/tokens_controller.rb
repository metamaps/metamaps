# frozen_string_literal: true
module Api
  module V2
    class TokensController < RestfulController
      protect_from_forgery

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

      private

      def current_user
        token_user || doorkeeper_user || method(:current_user).super_method.super_method.call
      end
    end
  end
end

# frozen_string_literal: true
module Api
  module V2
    class MappingsController < RestfulController
      def searchable_columns
        []
      end

      def create
        instantiate_resource
        resource.user = current_user if current_user.present?
        resource.updated_by = current_user if current_user.present?
        authorize resource
        create_action
        respond_with_resource
      end

      def update
        resource.updated_by = current_user if current_user.present?
        update_action
        respond_with_resource
      end

      def destroy
        resource.updated_by = current_user if current_user.present?
        destroy_action
        head :no_content
      end
    end
  end
end

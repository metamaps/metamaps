# frozen_string_literal: true
module Api
  module V2
    class MappingsController < RestfulController
      def searchable_columns
        []
      end

      def update
        # mappings are the only things where the user is set to the latest updater
        # done this way so that the model hooks can use the mapping user to determine who took this action
        resource.user = current_user if current_user.present? # current_user should always be present
        update_action
        respond_with_resource
      end

      def destroy
        # this is done so that the model hooks can use the mapping user to determine who took this action
        resource.user = current_user if current_user.present? # current_user should always be present
        destroy_action
        head :no_content
      end
    end
  end
end

# frozen_string_literal: true
module Api
  module V2
    class MappingsController < RestfulController
      def searchable_columns
        []
      end

      def update
        # hack: set the user temporarily so the model hook can reference it, then set it back
        temp = resource.user
        resource.user = current_user
        update_action
        respond_with_resource
        resourse.user = temp
        update_action
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

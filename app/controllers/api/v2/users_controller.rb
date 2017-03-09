# frozen_string_literal: true
module Api
  module V2
    class UsersController < RestfulController
      def current
        raise Pundit::NotAuthorizedError if current_user.nil?
        @user = current_user
        authorize @user
        show # delegate to the normal show function
      end

      private

      def searchable_columns
        [:name]
      end

      # only ask serializer to return is_admin field if we're on the
      # current_user action
      def default_scope
        super.merge(show_full_user: action_name == 'current')
      end
    end
  end
end

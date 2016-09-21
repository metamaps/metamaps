module Api
  module V2
    class SessionsController < ApplicationController
      def create
        @user = User.find_by(email: params[:email])
        if @user && @user.valid_password(params[:password])
          sign_in(@user)
          render json: @user
        else
          render json: { error: 'Error' }
        end
      end

      def destroy
        sign_out
        head :no_content
      end
    end
  end
end

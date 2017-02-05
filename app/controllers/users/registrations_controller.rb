# frozen_string_literal: true
module Users
  class RegistrationsController < Devise::RegistrationsController
    before_action :configure_sign_up_params, only: [:create]
    before_action :configure_account_update_params, only: [:update]
    after_action :store_location, only: [:new]

    protected

    def after_update_path_for(resource)
      signed_in_root_path(resource)
    end

    def after_sign_in_path_for(resource)
      stored = stored_location_for(User)
      return stored if stored

      if request.referer&.match(sign_in_url) || request.referer&.match(sign_up_url)
        super
      else
        request.referer || root_path
      end
    end

    private

    def store_location
      store_location_for(User, params[:redirect_to]) if params[:redirect_to]
    end

    def configure_sign_up_params
      devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :joinedwithcode])
    end

    def configure_account_update_params
      devise_parameter_sanitizer.permit(:account_update, keys: [:image])
    end
  end
end

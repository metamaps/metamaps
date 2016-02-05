class Users::RegistrationsController < Devise::RegistrationsController
  before_filter :configure_sign_up_params, only: [:create]
  before_filter :configure_account_update_params, only: [:update]

  protected
    def after_sign_up_path_for(resource)
      signed_in_root_path(resource)
    end

    def after_update_path_for(resource)
      signed_in_root_path(resource)
    end

  private
    def configure_sign_up_params
      devise_parameter_sanitizer.for(:sign_up) << [:name, :joinedwithcode]
    end

    def configure_account_update_params
      puts devise_parameter_sanitizer_for(:account_update)
      devise_parameter_sanitizer.for(:account_update) << [:image]
    end
end

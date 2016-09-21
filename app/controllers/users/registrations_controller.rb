class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]
  before_action :configure_account_update_params, only: [:update]

  protected

  def after_sign_up_path_for(resource)
    signed_in_root_path(resource)
  end

  def after_update_path_for(resource)
    signed_in_root_path(resource)
  end

  private

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :joinedwithcode])
  end

  def configure_account_update_params
    devise_parameter_sanitizer.permit(:account_update, keys: [:image])
  end
end

# frozen_string_literal: true
class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]
  before_action :configure_account_update_params, only: [:update]
  after_action :store_location, only: [:new]

  protected

  def after_update_path_for(resource)
    signed_in_root_path(resource)
  end

  private

  def store_location
    if params[:redirect_to]
      store_location_for(User, params[:redirect_to])    
    end
  end

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :joinedwithcode])
  end

  def configure_account_update_params
    devise_parameter_sanitizer.permit(:account_update, keys: [:image])
  end
end

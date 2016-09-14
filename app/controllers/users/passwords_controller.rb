class Users::PasswordsController < Devise::PasswordsController
  protected

  def after_resetting_password_path_for(resource)
    signed_in_root_path(resource)
  end

  def after_sending_reset_password_instructions_path_for(resource_name)
    new_user_session_path if is_navigational_format?
  end
end

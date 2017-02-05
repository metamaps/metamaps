# frozen_string_literal: true
module Users
  class PasswordsController < Devise::PasswordsController
    protected

    def after_resetting_password_path_for(resource)
      signed_in_root_path(resource)
    end

    def after_sending_reset_password_instructions_path_for(_resource_name)
      sign_in_path if is_navigational_format?
    end
  end
end

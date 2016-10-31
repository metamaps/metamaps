class Users::SessionsController < Devise::SessionsController
  protected

  def after_sign_in_path_for(resource)
    stored = stored_location_for(User)
    return stored if stored

    if request.referer&.match(sign_in_url) || request.referer&.match(sign_up_url)
      super
    else
      request.referer || root_path
    end
  end
end

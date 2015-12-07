class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :get_invite_link
  
  # this is for global login
  include ContentHelper
  
  helper_method :user
  helper_method :authenticated?
  helper_method :admin?
  
  def after_sign_in_path_for(resource)
    sign_in_url = url_for(:action => 'new', :controller => 'sessions', :only_path => false, :protocol => 'http')

    if request.referer == sign_in_url
      super
    elsif params[:uv_login] == "1"
      "http://support.metamaps.cc/login_success?sso=" + current_sso_token
    else
      stored_location_for(resource) || request.referer || root_path
    end
  end
  
private

  def require_no_user
    if authenticated?
      redirect_to edit_user_path(user), notice: "You must be logged out."
      return false
    end
  end
  
  def require_user
    unless authenticated?
      redirect_to new_user_session_path, notice: "You must be logged in."
      return false
    end
  end
    
  def require_admin
    unless authenticated? && admin?
      redirect_to root_url, notice: "You need to be an admin for that."
      return false
    end
  end
  
  def user
    current_user
  end
  
  def authenticated?
    current_user
  end
    
  def admin?
    current_user && current_user.admin
  end

  def get_invite_link
    unsafe_uri = request.env["REQUEST_URI"]
    valid_url = /^https?:\/\/([\w\.-]+)(:\d{1,5})?\/?$/
    safe_uri = (unsafe_uri.match(valid_url)) ? unsafe_uri : "http://metamaps.cc/"
    @invite_link = "#{safe_uri}join" + (current_user ? "?code=#{current_user.code}" : "")
  end
end

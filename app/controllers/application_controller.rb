class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :get_invite_link
  after_action :allow_embedding
  
  # this is for global login
  include ContentHelper
  
  helper_method :user
  helper_method :authenticated?
  helper_method :admin?
  
  def after_sign_in_path_for(resource)
    unsafe_uri = request.env["REQUEST_URI"]
    if unsafe_uri.starts_with?('http') && !unsafe_uri.starts_with?('https')
      protocol = 'http'
    else
      protocol = 'https'
    end
    sign_in_url = url_for(:action => 'new', :controller => 'sessions', :only_path => false, :protocol => protocol)

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
    authenticated? && current_user.admin
  end

  def get_invite_link
    @invite_link = "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : "")
  end

  def allow_embedding
    #allow all
    response.headers.except! 'X-Frame-Options'
    # or allow a whitelist
    # response.headers['X-Frame-Options'] = 'ALLOW-FROM http://blog.metamaps.cc'
  end
end

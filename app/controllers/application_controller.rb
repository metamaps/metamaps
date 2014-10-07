class ApplicationController < ActionController::Base
  protect_from_forgery
  
  # this is for global login
  include ContentHelper
  
  helper_method :user
  helper_method :authenticated?
  helper_method :admin?
  
  def after_sign_in_path_for(resource)
    sign_in_url = url_for(:action => 'new', :controller => 'sessions', :only_path => false, :protocol => 'http')
    if request.referer == sign_in_url
      super
    else
      stored_location_for(resource) || request.referer || root_path
    end
  end
  
private

  def require_no_user
    if authenticated?
      flash[:warning] = "You must be logged out."
      store and redirect_to edit_user_path(user)
      return false
    end
  end
  
  def require_user
    unless authenticated?
      flash[:warning] = "You must be logged in."
      store_location and redirect_to new_user_session_path
      return false
    end
  end
    
  def require_admin
    unless authenticated? && user.admin
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
  
end

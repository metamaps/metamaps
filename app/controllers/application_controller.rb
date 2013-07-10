class ApplicationController < ActionController::Base
  protect_from_forgery
  
  helper_method :user
  helper_method :authenticated?
  
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
      store and redirect_to new_session_path
      return false
    end
  end
  
  def user
    current_user
  end
  
    
  def authenticated?
    current_user
  end
  
end

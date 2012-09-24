class ApplicationController < ActionController::Base
  protect_from_forgery
  
  helper_method :user
  helper_method :authenticated?
  
private

  def require_no_user
    if authenticated?
      flash[:warning] = "You must be logged out."
      store and redirect_to edit_user_path
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
  
  def current_user
    return @current_user if defined?(@current_user)
    @current_user = current_session && current_session.user
  end
  
  def current_session
    return @current_session if defined?(@current_session) 
    @current_session = Session.find
  end
  
  def user
    current_user
  end
  
    
  def authenticated?
    current_user
  end
  
  def store
    session[:location] = request.fullpath
  end
  
  def restore(options)
    location = session[:location] || options[:default]
    session[:location] = nil
    return location
  end
  
end

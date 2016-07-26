class ApplicationController < ActionController::Base
  include ApplicationHelper
  include Pundit
  include PunditExtra
  rescue_from Pundit::NotAuthorizedError, with: :handle_unauthorized
  protect_from_forgery(with: :exception)

  before_action :get_invite_link
  after_action :allow_embedding

  def default_serializer_options
    { root: false }
  end

  # this is for global login
  include ContentHelper

  helper_method :user
  helper_method :authenticated?
  helper_method :admin?

  def after_sign_in_path_for(resource)
    sign_in_url = url_for(action: 'new', controller: 'sessions', only_path: false, protocol: 'https')

    if request.referer == sign_in_url
      super
    elsif params[:uv_login] == '1'
      'http://support.metamaps.cc/login_success?sso=' + current_sso_token
    else
      stored_location_for(resource) || request.referer || root_path
    end
  end

  def handle_unauthorized
    if authenticated?
      head :forbidden # TODO: make this better
    else
      redirect_to new_user_session_path, notice: 'Try signing in to do that.'
    end
  end

  private

  def get_invite_link
    @invite_link = "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : '')
  end

  def require_no_user
    if authenticated?
      redirect_to edit_user_path(user), notice: 'You must be logged out.'
      return false
    end
  end

  def require_user
    unless authenticated?
      redirect_to new_user_session_path, notice: 'You must be logged in.'
      return false
    end
  end

  def require_admin
    unless authenticated? && admin?
      redirect_to root_url, notice: 'You need to be an admin for that.'
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

  def allow_embedding
    # allow all
    response.headers.except! 'X-Frame-Options'
    # or allow a whitelist
    # response.headers['X-Frame-Options'] = 'ALLOW-FROM http://blog.metamaps.cc'
  end
end

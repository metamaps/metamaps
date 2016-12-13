# frozen_string_literal: true
class ApplicationController < ActionController::Base
  include ApplicationHelper
  include Pundit
  include PunditExtra
  rescue_from Pundit::NotAuthorizedError, with: :handle_unauthorized
  protect_from_forgery(with: :exception)

  before_action :invite_link
  before_action :prepare_exception_notifier
  after_action :allow_embedding

  def default_serializer_options
    { root: false }
  end

  # this is for global login
  include ContentHelper

  helper_method :user
  helper_method :authenticated?
  helper_method :admin?

  def handle_unauthorized
    if authenticated? && (params[:controller] == 'maps') && (params[:action] == 'show')
      redirect_to request_access_map_path(params[:id])
    elsif authenticated?
      redirect_to root_path, notice: "You don't have permission to see that page."
    else
      store_location_for(resource, request.fullpath)
      redirect_to sign_in_path, notice: 'Try signing in to do that.'
    end
  end

  private

  def invite_link
    @invite_link = "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : '')
  end

  def require_no_user
    return true unless authenticated?
    redirect_to edit_user_path(user), notice: 'You must be logged out.'
    false
  end

  def require_user
    return true if authenticated?
    redirect_to sign_in_path, notice: 'You must be logged in.'
    false
  end

  def require_admin
    return true if authenticated? && admin?
    redirect_to root_url, notice: 'You need to be an admin for that.'
    false
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

  def prepare_exception_notifier
    request.env['exception_notifier.exception_data'] = {
      current_user: current_user
    }
  end
end

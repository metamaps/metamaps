# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include ApplicationHelper
  include Pundit
  include PunditExtra
  rescue_from Pundit::NotAuthorizedError, with: :handle_unauthorized

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
    head :forbidden
  end

  private

  def invite_link
    @invite_link = "#{request.base_url}/join" + (current_user ? "?code=#{current_user.code}" : '')
  end

  def require_no_user
    return true unless authenticated?
    head :forbidden
    false
  end

  def require_user
    return true if authenticated?
    head :forbidden
    false
  end

  def require_admin
    return true if authenticated? && admin?
    head :forbidden
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

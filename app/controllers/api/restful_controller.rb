class API::RestfulController < ActionController::Base
  include Pundit
  include PunditExtra

  snorlax_used_rest!

  load_and_authorize_resource only: [:show, :update, :destroy]

  def create
    instantiate_resource
    resource.user = current_user
    authorize resource
    create_action
    respond_with_resource
  end

  private

  def resource_serializer
    "new_#{resource_name}_serializer".camelize.constantize
  end

  def accessible_records
    if current_user
      visible_records
    else
      public_records
    end
  end

  def current_user
    super || token_user || doorkeeper_user || nil
  end

  def token_user
    token = params[:access_token]
    access_token = Token.find_by_token(token)
    @token_user ||= access_token.user if access_token
  end

  def doorkeeper_user
    return unless doorkeeper_token.present?
    doorkeeper_render_error unless valid_doorkeeper_token?
    @doorkeeper_user ||= User.find(doorkeeper_token.resource_owner_id)
  end

  def permitted_params
    @permitted_params ||= PermittedParams.new(params)
  end
end

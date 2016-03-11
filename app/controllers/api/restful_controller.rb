class API::RestfulController < ActionController::Base
  include Pundit
  include PunditExtra

  snorlax_used_rest!

  rescue_from(Pundit::NotAuthorizedError) { |e| respond_with_standard_error e, 403 }
  load_and_authorize_resource except: [:index, :create] 

  def create
    authorize resource_class
    instantiate_resouce
    resource.user = current_user
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
    super || token_user || nil
  end

  def token_user
    authenticate_with_http_token do |token, options|
      access_token = Token.find_by_token(token)
      if access_token
        @token_user ||= access_token.user
      end
    end
  end

  def permitted_params
    @permitted_params ||= PermittedParams.new(params)
  end

end

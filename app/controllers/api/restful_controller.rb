class API::RestfulController < ActionController::Base
  snorlax_used_rest!

  def create
    raise CanCan::AccessDenied.new unless current_user.is_logged_in?
    instantiate_resouce
    resource.user = current_user
    create_action
    respond_with_resource
  end

  def show
    load_resource
    raise AccessDenied.new unless resource.authorize_to_show(current_user)
    respond_with_resource
  end

  private

  def current_user
    super || token_user || LoggedOutUser.new
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
